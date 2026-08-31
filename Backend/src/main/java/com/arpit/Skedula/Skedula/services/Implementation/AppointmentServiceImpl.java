package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.CancellationPreviewDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.*;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.EscrowService;
import com.arpit.Skedula.Skedula.services.PaymentService;
import com.arpit.Skedula.Skedula.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("appointmentService")
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final WalletService walletService;

    @Override
    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO) {
        LocalDateTime apptDateTime = appointmentDTO.getDateTime().withSecond(0).withNano(0);
        appointmentDTO.setDateTime(apptDateTime);
        if(apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date cannot be in the past.");
        }

        Business business = businessRepository.findById(appointmentDTO.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + appointmentDTO.getBusinessId()));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointmentDTO.getServiceOffered())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if(apptDateTime.toLocalTime().isBefore(business.getOpenTime()) ||
           apptDateTime.toLocalTime().isAfter(business.getCloseTime().minusMinutes(serviceOffered.getDuration()))) {
            throw new RuntimeException("Appointment time must be within business operating hours: " +
                    business.getOpenTime() + " - " + business.getCloseTime().minusMinutes(serviceOffered.getDuration()));
        }

        // Concurrency / Overlap check on this date
        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> dayAppts = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(
                business.getId(), startOfDay, endOfDay
        );

        LocalTime reqStart = apptDateTime.toLocalTime();
        LocalTime reqEnd = reqStart.plusMinutes(serviceOffered.getDuration());

        for (Appointment existing : dayAppts) {
            if (existing.getAppointmentStatus() == AppointmentStatus.BOOKED || existing.getAppointmentStatus() == AppointmentStatus.PENDING) {
                LocalTime exStart = existing.getAppointmentDateTime().toLocalTime();
                long exDur = existing.getServiceOffered() != null && existing.getServiceOffered().getDuration() != null
                        ? existing.getServiceOffered().getDuration() : 60L;
                LocalTime exEnd = exStart.plusMinutes(exDur);

                if (reqStart.isBefore(exEnd) && exStart.isBefore(reqEnd)) {
                    throw new RuntimeException("Requested slot conflicts with an existing booking. Please choose another time or date.");
                }
            }
        }

        Long total = serviceOffered.getTotalSlots();
        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(
                appointmentDTO.getServiceOffered(),
                startOfDay,
                endOfDay,
                AppointmentStatus.BOOKED
        );

        Customer customer;
        if (appointmentDTO.getBookedBy() != null) {
            customer = customerRepository.findById(appointmentDTO.getBookedBy())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointmentDTO.getBookedBy()));
        } else {
            User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            customer = customerRepository.findByUser(currentUser)
                    .orElseGet(() -> {
                        Customer newCust = new Customer();
                        newCust.setUser(currentUser);
                        newCust.setCustomerId("SKECS" + UUID.randomUUID().toString().replace("-", ""));
                        return customerRepository.save(newCust);
                    });
            appointmentDTO.setBookedBy(customer.getId());
        }

        Wallet customerWallet = walletRepository.findByUser_Id(customer.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found for user: " + customer.getUser().getId()));

        if(customerWallet.getBalance().compareTo(serviceOffered.getPrice()) < 0) {
            throw new RuntimeException("Insufficient balance in wallet to book the appointment.");
        }
        if(booked >= total) {
            throw new RuntimeException("No slots available for the selected service on the given date.");
        }

        appointmentDTO.setAppointmentId(generateAppointmentId());
        Appointment newAppointment = convertToEntity(appointmentDTO, serviceOffered, customer);
        newAppointment.setAppointmentStatus(AppointmentStatus.PENDING);
        Appointment savedAppointment = appointmentRepository.save(newAppointment);

        // LOCK FUNDS IN ESCROW: Deduct immediately from customer's wallet & hold in escrow
        escrowService.holdInEscrow(savedAppointment, customer, business, serviceOffered, serviceOffered.getPrice());
        paymentService.createNewPayment(savedAppointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, LocalDateTime newDateTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (appointment.getAppointmentStatus() != AppointmentStatus.BOOKED && appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only Booked or Pending appointments can be rescheduled.");
        }

        LocalDateTime apptDateTime = newDateTime.withSecond(0).withNano(0);
        if (apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Rescheduled date & time cannot be in the past.");
        }

        Business business = appointment.getBusiness();
        BusinessServiceOffered serviceOffered = appointment.getServiceOffered();

        if (apptDateTime.toLocalTime().isBefore(business.getOpenTime()) ||
            apptDateTime.toLocalTime().isAfter(business.getCloseTime().minusMinutes(serviceOffered.getDuration()))) {
            throw new RuntimeException("Rescheduled time must be within business operating hours: " +
                    business.getOpenTime() + " - " + business.getCloseTime().minusMinutes(serviceOffered.getDuration()));
        }

        // Conflict check for new slot
        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> dayAppts = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(
                business.getId(), startOfDay, endOfDay
        );

        LocalTime reqStart = apptDateTime.toLocalTime();
        LocalTime reqEnd = reqStart.plusMinutes(serviceOffered.getDuration());

        for (Appointment existing : dayAppts) {
            if (!existing.getId().equals(appointment.getId()) &&
                (existing.getAppointmentStatus() == AppointmentStatus.BOOKED || existing.getAppointmentStatus() == AppointmentStatus.PENDING)) {
                LocalTime exStart = existing.getAppointmentDateTime().toLocalTime();
                long exDur = existing.getServiceOffered() != null && existing.getServiceOffered().getDuration() != null
                        ? existing.getServiceOffered().getDuration() : 60L;
                LocalTime exEnd = exStart.plusMinutes(exDur);

                if (reqStart.isBefore(exEnd) && exStart.isBefore(reqEnd)) {
                    throw new RuntimeException("The selected slot conflicts with another booking. Please select another slot.");
                }
            }
        }

        appointment.setAppointmentDateTime(apptDateTime);
        appointment.setRescheduledAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    @Override
    public CancellationPreviewDTO getCancellationPreview(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        BigDecimal total = appointment.getServiceOffered() != null ? appointment.getServiceOffered().getPrice() : BigDecimal.ZERO;
        Business business = appointment.getBusiness();
        int cutoff = business.getCancellationCutoffMinutes() != null ? business.getCancellationCutoffMinutes() : 120;
        double feePct = business.getCancellationFeePercentage() != null ? business.getCancellationFeePercentage() : 20.0;

        boolean isLate = false;
        long minutesRemaining = 0;
        if (appointment.getAppointmentDateTime() != null) {
            minutesRemaining = Duration.between(LocalDateTime.now(), appointment.getAppointmentDateTime()).toMinutes();
            // Late fees only apply to confirmed BOOKED appointments.
            // PENDING appointments cancelled by customer receive 100% refund immediately.
            if (appointment.getAppointmentStatus() == AppointmentStatus.BOOKED) {
                isLate = minutesRemaining < cutoff;
            }
        }

        BigDecimal fee = BigDecimal.ZERO;
        BigDecimal refund = total;

        if (isLate) {
            fee = total.multiply(BigDecimal.valueOf(feePct / 100.0)).setScale(2, RoundingMode.HALF_UP);
            refund = total.subtract(fee).max(BigDecimal.ZERO);
        }

        return CancellationPreviewDTO.builder()
                .isLateCancellation(isLate)
                .totalAmount(total)
                .cancellationFee(fee)
                .refundAmount(refund)
                .cutoffMinutes(cutoff)
                .feePercentage(feePct)
                .minutesRemaining(minutesRemaining)
                .build();
    }

    @Override
    public AppointmentDTO approveAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        LocalDateTime apptDateTime = appointment.getAppointmentDateTime().withSecond(0).withNano(0);
        if(apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot approve appointment for past date.");
        }

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered().getId()));

        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(
                appointment.getServiceOffered().getId(),
                startOfDay,
                endOfDay,
                AppointmentStatus.BOOKED
        );

        if(booked >= serviceOffered.getTotalSlots()) {
            throw new RuntimeException("No slots available for the selected service on the given date.");
        }

        appointment.setAppointmentStatus(AppointmentStatus.BOOKED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        // Note: Funds remain safely in Escrow during BOOKED status until session is marked DONE!
        return convertToDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        appointment.setAppointmentStatus(AppointmentStatus.REJECTED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // REFUND FROM ESCROW: Return funds back to customer wallet
        BigDecimal refundAmt = savedAppointment.getServiceOffered() != null ? savedAppointment.getServiceOffered().getPrice() : BigDecimal.ZERO;
        escrowService.refundToCustomer(savedAppointment, refundAmt);
        paymentService.refundPayment(savedAppointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO doneAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if(appointment.getAppointmentStatus() != AppointmentStatus.BOOKED) {
            throw new RuntimeException("Only booked appointments can be marked as done.");
        }
        appointment.setAppointmentStatus(AppointmentStatus.DONE);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // RELEASE FROM ESCROW: Disburse payout to business owner
        escrowService.releaseToBusiness(savedAppointment);
        paymentService.processPayment(savedAppointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    public List<AppointmentCard> getPendingAppointmentRequest(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointmentList = appointmentRepository.findByBusiness_IdAndAppointmentStatus(businessId, AppointmentStatus.PENDING);
        return appointmentList.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentCard getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return convertToCard(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByCustomer(Long id){
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        cancelBooking(id);
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByOwner(Long id){
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        BigDecimal price = savedAppointment.getServiceOffered() != null ? savedAppointment.getServiceOffered().getPrice() : BigDecimal.ZERO;
        escrowService.refundToCustomer(savedAppointment, price);
        paymentService.refundPayment(savedAppointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    public List<AppointmentCard> getAppointmentByCustomerId(Long customerId) {
        List<Appointment> appointmentList = appointmentRepository.findByBookedBy_Id(customerId);
        return appointmentList.stream()
                .map(this::convertToCard)
                .toList();
    }

    @Override
    public List<AppointmentCard> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId) {
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndServiceOffered_Id(businessId, serviceId);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAllAppointmentsByBusinessId(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(businessId);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentsOnAndAfterDate(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeIsGreaterThanEqual(businessId, LocalDateTime.now());
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentsBeforeDate(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBefore(businessId, LocalDateTime.now());
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentBydate(LocalDateTime dateTime, Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        LocalDateTime startOfDay = dateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = dateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(businessId, startOfDay, endOfDay);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Void cancelBooking(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if(appointment.getAppointmentStatus() != AppointmentStatus.BOOKED && appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only active booked or pending appointments can be cancelled.");
        }

        CancellationPreviewDTO preview = getCancellationPreview(id);

        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Refund customer from Escrow
        escrowService.refundToCustomer(savedAppointment, preview.getRefundAmount());

        // If a late fee was charged, credit the business owner
        if (preview.getCancellationFee() != null && preview.getCancellationFee().compareTo(BigDecimal.ZERO) > 0 &&
                savedAppointment.getBusiness() != null && savedAppointment.getBusiness().getOwner() != null) {
            walletService.addMoney(savedAppointment.getBusiness().getOwner(), preview.getCancellationFee(), "ESC_CANCFEE_" + savedAppointment.getAppointmentId(), savedAppointment);
        }

        paymentService.refundBookedAppointmentPayment(savedAppointment, preview.getRefundAmount());

        return null;
    }

    @Override
    @Transactional
    public void cancelAllAppointmentsByBusinessId(Long id) {
        businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(id);
        List<Appointment> bookedAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());
        for(Appointment appointment : bookedAppointments){
            cancelAppointmentByOwner(appointment.getId());
        }

        List<Appointment> pendingAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.PENDING)
                .collect(Collectors.toList());

        for(Appointment appointment : pendingAppointments) {
            rejectAppointment(appointment.getId());
        }
    }

    @Override
    @Transactional
    public void cancelAllAppointmentsByServiceOfferedId(Long id) {
        businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        List<Appointment> appointments = appointmentRepository.findByServiceOffered_Id(id);
        List<Appointment> bookedAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());
        for(Appointment appointment : bookedAppointments) {
            cancelAppointmentByOwner(appointment.getId());
        }

        List<Appointment> pendingAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.PENDING)
                .collect(Collectors.toList());

        for(Appointment appointment : pendingAppointments) {
            rejectAppointment(appointment.getId());
        }
    }

    private AppointmentCard convertToCard(Appointment newAppointment) {
        AppointmentCard result = new AppointmentCard();
        result.setId(newAppointment.getId());
        result.setAppointmentId(newAppointment.getAppointmentId());
        result.setBookedBy(newAppointment.getBookedBy().getId());
        result.setCustomerId(newAppointment.getBookedBy().getCustomerId());
        result.setServiceOffered(newAppointment.getServiceOffered().getId());
        result.setServiceOfferedId(newAppointment.getServiceOffered().getServiceOfferedId());
        result.setDateTime(newAppointment.getAppointmentDateTime());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        result.setBid(newAppointment.getServiceOffered().getBusiness().getBusinessId());
        result.setRescheduledAt(newAppointment.getRescheduledAt());
        return result;
    }

    public AppointmentDTO convertToDTO(Appointment newAppointment) {
        AppointmentDTO result = new AppointmentDTO();
        result.setId(newAppointment.getId());
        result.setAppointmentId(newAppointment.getAppointmentId());
        result.setBookedBy(newAppointment.getBookedBy().getId());
        result.setServiceOffered(newAppointment.getServiceOffered().getId());
        result.setDateTime(newAppointment.getAppointmentDateTime());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        return result;
    }

    private Appointment convertToEntity(AppointmentDTO appointmentDTO, BusinessServiceOffered serviceOffered, Customer customer) {
        Appointment appointment = new Appointment();
        appointment.setId(appointmentDTO.getId());
        appointment.setAppointmentId(appointmentDTO.getAppointmentId());
        appointment.setAppointmentDateTime(appointmentDTO.getDateTime());
        appointment.setNotes(appointmentDTO.getNotes());
        appointment.setAppointmentStatus(appointmentDTO.getAppointmentStatus());
        appointment.setServiceOffered(serviceOffered);
        appointment.setBookedBy(customer);
        appointment.setBusiness(serviceOffered.getBusiness());
        return appointment;
    }

    /**
     * Returns true if the currently authenticated user is either:
     * (a) the customer who booked this appointment, or
     * (b) the owner of the business that this appointment belongs to.
     */
    @Override
    public boolean isOwnerOrBusinessOwner(Long appointmentId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser == null) {
            return false;
        }
        // Admins can always view
        if (currentUser.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        // Check if the caller is the customer who booked
        if (appointment.getBookedBy() != null
                && appointment.getBookedBy().getUser() != null
                && appointment.getBookedBy().getUser().getEmail().equals(currentUser.getEmail())) {
            return true;
        }
        // Check if the caller is the business owner
        if (appointment.getBusiness() != null
                && appointment.getBusiness().getOwner() != null
                && appointment.getBusiness().getOwner().getEmail().equals(currentUser.getEmail())) {
            return true;
        }
        return false;
    }

    private boolean isAppointmentIdAvailable(String appointmentId) {
        return appointmentRepository.existsByAppointmentId(appointmentId);
    }

    private String generateAppointmentId() {
        String apptId =  "APPT-" + System.currentTimeMillis();
        if (isAppointmentIdAvailable(apptId)) {
             return generateAppointmentId();
        }
        return apptId;
    }
}
