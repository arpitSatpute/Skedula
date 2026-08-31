package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.AdminEscrowResponseDTO;
import com.arpit.Skedula.Skedula.dto.EscrowLedgerItemDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.EscrowStatus;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.EscrowTransactionRepository;
import com.arpit.Skedula.Skedula.services.EscrowService;
import com.arpit.Skedula.Skedula.services.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service("escrowService")
@RequiredArgsConstructor
public class EscrowServiceImpl implements EscrowService {

    private static final BigDecimal PLATFORM_FEE_RATE = BigDecimal.valueOf(0.05);

    private final EscrowTransactionRepository escrowTransactionRepository;
    private final WalletService walletService;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public EscrowTransaction holdInEscrow(Appointment appointment, Customer customer, Business business, BusinessServiceOffered service, BigDecimal amount) {
        log.info("Holding funds in Escrow: Customer={}, Business={}, Service={}, Amount=₹{}",
                customer.getId(), business.getId(), service.getId(), amount);

        // 1. Deduct funds from Customer Wallet
        String deductTxnId = "ESC_HOLD_" + appointment.getAppointmentId();
        walletService.deductMoney(customer.getUser(), amount, deductTxnId, appointment);

        // 2. Compute 5% fee and business share
        BigDecimal fee = amount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal businessShare = amount.subtract(fee);

        // 3. Create Escrow Transaction
        String escrowId = "ESCTX" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        EscrowTransaction escrow = EscrowTransaction.builder()
                .escrowTransactionId(escrowId)
                .appointment(appointment)
                .customer(customer)
                .business(business)
                .service(service)
                .amount(amount)
                .platformFee(fee)
                .businessShare(businessShare)
                .status(EscrowStatus.HELD_IN_ESCROW)
                .notes("Held in Escrow for " + service.getName() + " on " + appointment.getAppointmentDateTime())
                .build();

        return escrowTransactionRepository.save(escrow);
    }

    @Override
    @Transactional
    public void releaseToBusiness(Appointment appointment) {
        log.info("Releasing Escrow funds for completed appointment: {}", appointment.getAppointmentId());

        EscrowTransaction escrow = escrowTransactionRepository.findByAppointment(appointment)
                .orElse(null);

        if (escrow == null) {
            log.warn("No active EscrowTransaction found for appointment {}. Creating and settling...", appointment.getId());
            BigDecimal amount = appointment.getServiceOffered() != null ? appointment.getServiceOffered().getPrice() : BigDecimal.ZERO;
            BigDecimal fee = amount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal businessShare = amount.subtract(fee);

            escrow = EscrowTransaction.builder()
                    .escrowTransactionId("ESCTX" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                    .appointment(appointment)
                    .customer(appointment.getBookedBy())
                    .business(appointment.getBusiness())
                    .service(appointment.getServiceOffered())
                    .amount(amount)
                    .platformFee(fee)
                    .businessShare(businessShare)
                    .status(EscrowStatus.RELEASED_TO_BUSINESS)
                    .releasedAt(LocalDateTime.now())
                    .notes("Settled upon appointment completion")
                    .build();
            escrowTransactionRepository.save(escrow);

            // Credit Business Owner
            walletService.addMoney(appointment.getBusiness().getOwner(), businessShare, "ESC_REL_" + appointment.getAppointmentId(), appointment);
            return;
        }

        if (escrow.getStatus() != EscrowStatus.HELD_IN_ESCROW) {
            log.warn("Escrow transaction {} is not in HELD_IN_ESCROW status (status={})", escrow.getEscrowTransactionId(), escrow.getStatus());
            return;
        }

        // Credit Business Owner with their share (amount - 5% fee)
        BigDecimal businessShare = escrow.getBusinessShare() != null ? escrow.getBusinessShare()
                : escrow.getAmount().multiply(BigDecimal.ONE.subtract(PLATFORM_FEE_RATE)).setScale(2, RoundingMode.HALF_UP);

        walletService.addMoney(appointment.getBusiness().getOwner(), businessShare, "ESC_REL_" + appointment.getAppointmentId(), appointment);

        escrow.setStatus(EscrowStatus.RELEASED_TO_BUSINESS);
        escrow.setReleasedAt(LocalDateTime.now());
        escrowTransactionRepository.save(escrow);
        log.info("Released ₹{} from Escrow to Business Owner {}", businessShare, appointment.getBusiness().getOwner().getEmail());
    }

    @Override
    @Transactional
    public void refundToCustomer(Appointment appointment, BigDecimal refundAmount) {
        log.info("Refunding Escrow funds for cancelled/rejected appointment: {}, amount=₹{}", appointment.getAppointmentId(), refundAmount);

        EscrowTransaction escrow = escrowTransactionRepository.findByAppointment(appointment)
                .orElse(null);

        BigDecimal actualRefund = (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0)
                ? refundAmount
                : (appointment.getServiceOffered() != null ? appointment.getServiceOffered().getPrice() : BigDecimal.ZERO);

        if (escrow != null && escrow.getStatus() == EscrowStatus.HELD_IN_ESCROW) {
            escrow.setStatus(EscrowStatus.REFUNDED_TO_CUSTOMER);
            escrow.setReleasedAt(LocalDateTime.now());
            escrow.setNotes("Refunded ₹" + actualRefund + " to customer upon cancellation");
            escrowTransactionRepository.save(escrow);
        } else if (escrow == null) {
            escrow = EscrowTransaction.builder()
                    .escrowTransactionId("ESCTX" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                    .appointment(appointment)
                    .customer(appointment.getBookedBy())
                    .business(appointment.getBusiness())
                    .service(appointment.getServiceOffered())
                    .amount(actualRefund)
                    .platformFee(BigDecimal.ZERO)
                    .businessShare(BigDecimal.ZERO)
                    .status(EscrowStatus.REFUNDED_TO_CUSTOMER)
                    .releasedAt(LocalDateTime.now())
                    .notes("Refunded to customer upon cancellation")
                    .build();
            escrowTransactionRepository.save(escrow);
        }

        // Credit Customer Wallet with refund
        if (actualRefund.compareTo(BigDecimal.ZERO) > 0 && appointment.getBookedBy() != null && appointment.getBookedBy().getUser() != null) {
            walletService.addMoney(appointment.getBookedBy().getUser(), actualRefund, "ESC_REF_" + appointment.getAppointmentId(), appointment);
            log.info("Credited ₹{} refund back to customer {}", actualRefund, appointment.getBookedBy().getUser().getEmail());
        }
    }

    @Override
    public AdminEscrowResponseDTO getAdminEscrowSummary() {
        List<EscrowTransaction> allTransactions = new ArrayList<>(escrowTransactionRepository.findAllByOrderByCreatedAtDesc());

        // Auto-index any existing appointments that predated EscrowTransaction
        try {
            List<Appointment> allAppts = appointmentRepository.findAll();
            for (Appointment appt : allAppts) {
                if (appt.getAppointmentStatus() == null || appt.getServiceOffered() == null) continue;
                boolean exists = allTransactions.stream().anyMatch(t -> t.getAppointment() != null && t.getAppointment().getId().equals(appt.getId()));
                if (!exists) {
                    BigDecimal amt = appt.getServiceOffered().getPrice() != null ? appt.getServiceOffered().getPrice() : BigDecimal.ZERO;
                    BigDecimal fee = amt.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal share = amt.subtract(fee);
                    EscrowStatus status = EscrowStatus.HELD_IN_ESCROW;
                    if (appt.getAppointmentStatus() == AppointmentStatus.DONE) {
                        status = EscrowStatus.RELEASED_TO_BUSINESS;
                    } else if (appt.getAppointmentStatus() == AppointmentStatus.CANCELLED || appt.getAppointmentStatus() == AppointmentStatus.REJECTED) {
                        status = EscrowStatus.REFUNDED_TO_CUSTOMER;
                    }
                    EscrowTransaction backfilled = EscrowTransaction.builder()
                            .escrowTransactionId("ESCTX" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                            .appointment(appt)
                            .customer(appt.getBookedBy())
                            .business(appt.getBusiness())
                            .service(appt.getServiceOffered())
                            .amount(amt)
                            .platformFee(fee)
                            .businessShare(share)
                            .status(status)
                            .notes("Auto-indexed session (" + appt.getAppointmentStatus() + ")")
                            .build();
                    try {
                        EscrowTransaction saved = escrowTransactionRepository.save(backfilled);
                        allTransactions.add(0, saved);
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Escrow backfill check skipped: {}", e.getMessage());
        }

        BigDecimal totalEscrowBalance = BigDecimal.ZERO;
        BigDecimal totalReleased = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;
        BigDecimal totalFees = BigDecimal.ZERO;
        long activeHolds = 0;

        List<EscrowLedgerItemDTO> ledger = new ArrayList<>();

        for (EscrowTransaction tx : allTransactions) {
            BigDecimal amt = tx.getAmount() != null ? tx.getAmount() : BigDecimal.ZERO;
            BigDecimal fee = tx.getPlatformFee() != null ? tx.getPlatformFee() : BigDecimal.ZERO;
            BigDecimal share = tx.getBusinessShare() != null ? tx.getBusinessShare() : amt.subtract(fee);

            if (tx.getStatus() == EscrowStatus.HELD_IN_ESCROW) {
                totalEscrowBalance = totalEscrowBalance.add(amt);
                activeHolds++;
            } else if (tx.getStatus() == EscrowStatus.RELEASED_TO_BUSINESS) {
                totalReleased = totalReleased.add(share);
                totalFees = totalFees.add(fee);
            } else if (tx.getStatus() == EscrowStatus.REFUNDED_TO_CUSTOMER) {
                totalRefunded = totalRefunded.add(amt);
            }

            Customer cust = tx.getCustomer();
            Business biz = tx.getBusiness();
            BusinessServiceOffered svc = tx.getService();
            Appointment appt = tx.getAppointment();

            ledger.add(EscrowLedgerItemDTO.builder()
                    .id(tx.getId())
                    .escrowTransactionId(tx.getEscrowTransactionId())
                    // WHO
                    .customerId(cust != null ? cust.getId() : null)
                    .customerCode(cust != null ? cust.getCustomerId() : null)
                    .customerName(cust != null && cust.getUser() != null ? cust.getUser().getName() : "Customer")
                    .customerEmail(cust != null && cust.getUser() != null ? cust.getUser().getEmail() : "N/A")
                    // FOR WHOM
                    .businessId(biz != null ? biz.getId() : null)
                    .businessName(biz != null ? biz.getName() : "Business")
                    .businessOwnerId(biz != null && biz.getOwner() != null ? biz.getOwner().getId() : null)
                    .businessOwnerName(biz != null && biz.getOwner() != null ? biz.getOwner().getName() : "Owner")
                    .businessOwnerEmail(biz != null && biz.getOwner() != null ? biz.getOwner().getEmail() : "N/A")
                    // FOR WHAT
                    .serviceId(svc != null ? svc.getId() : null)
                    .serviceName(svc != null ? svc.getName() : "Service")
                    .appointmentId(appt != null ? appt.getId() : null)
                    .appointmentCode(appt != null ? appt.getAppointmentId() : null)
                    .appointmentDateTime(appt != null ? appt.getAppointmentDateTime() : null)
                    // FINANCIALS
                    .amount(amt)
                    .platformFee(fee)
                    .businessShare(share)
                    // STATUS & TIMESTAMPS
                    .status(tx.getStatus() != null ? tx.getStatus().name() : EscrowStatus.HELD_IN_ESCROW.name())
                    .createdAt(tx.getCreatedAt())
                    .releasedAt(tx.getReleasedAt())
                    .notes(tx.getNotes())
                    .build());
        }

        return AdminEscrowResponseDTO.builder()
                .totalEscrowBalance(totalEscrowBalance)
                .totalReleasedToBusinesses(totalReleased)
                .totalRefundedToCustomers(totalRefunded)
                .totalPlatformFeesEarned(totalFees)
                .activeHoldsCount(activeHolds)
                .ledger(ledger)
                .build();
    }
}
