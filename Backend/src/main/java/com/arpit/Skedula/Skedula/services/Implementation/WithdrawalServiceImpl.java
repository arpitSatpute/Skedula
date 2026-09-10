package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.*;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.entity.enums.WithdrawalStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.OwnerPayoutConfigRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.repository.WithdrawalRepository;
import com.arpit.Skedula.Skedula.services.RazorpayXService;
import com.arpit.Skedula.Skedula.services.WalletTransactionService;
import com.arpit.Skedula.Skedula.services.WithdrawalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalServiceImpl implements WithdrawalService {

    private final WithdrawalRepository withdrawalRepository;
    private final WalletRepository walletRepository;
    private final OwnerPayoutConfigRepository ownerPayoutConfigRepository;
    private final RazorpayXService razorpayXService;
    private final WalletTransactionService walletTransactionService;

    @Override
    @Transactional
    public WithdrawalResponseDTO requestWithdrawal(User user, WithdrawalRequestDTO request) {
        if (user == null) {
            throw new ResourceNotFoundException("Authenticated user required");
        }

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Withdrawal amount must be at least ₹1.00");
        }

        // 1. Lock User Wallet with Pessimistic Write Lock (SELECT FOR UPDATE)
        Wallet wallet = walletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + user.getId()));

        if (wallet.getBalance() == null) {
            wallet.setBalance(BigDecimal.ZERO);
        }
        if (wallet.getReservedBalance() == null) {
            wallet.setReservedBalance(BigDecimal.ZERO);
        }

        // 2. Validate Available Balance
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException(String.format("Insufficient withdrawable balance. Available: ₹%.2f, Requested: ₹%.2f",
                    wallet.getBalance(), amount));
        }

        // 3. Move amount from Available Balance to In-Flight Reserved Balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setReservedBalance(wallet.getReservedBalance().add(amount));
        walletRepository.save(wallet);

        // 4. Resolve or create Payout Account Config
        OwnerPayoutConfig config = ownerPayoutConfigRepository.findByUser(user).orElse(null);

        boolean hasExplicitDetails = request.getDestinationDetails() != null && !request.getDestinationDetails().isBlank();
        if (hasExplicitDetails) {
            if (config == null) {
                config = OwnerPayoutConfig.builder().user(user).build();
            }
            config.setAccountType(request.getDestinationType() != null ? request.getDestinationType() : "bank_account");
            config.setBeneficiaryName(request.getBeneficiaryName() != null && !request.getBeneficiaryName().isBlank()
                    ? request.getBeneficiaryName() : (user.getName() != null ? user.getName() : "Account Holder"));

            if ("vpa".equalsIgnoreCase(request.getDestinationType())) {
                config.setVpaAddress(request.getDestinationDetails().trim());
            } else {
                config.setAccountNumber(request.getDestinationDetails().trim());
                if (request.getIfscCode() != null && !request.getIfscCode().isBlank()) {
                    config.setIfscCode(request.getIfscCode().trim().toUpperCase());
                }
            }
            config.setRazorpayFundAccountId(null); // Invalidate cached fund account for new details
            config = ownerPayoutConfigRepository.save(config);
        }

        if (config == null || (config.getAccountNumber() == null && config.getVpaAddress() == null)) {
            // Revert reservation if payout destination is missing
            wallet.setReservedBalance(wallet.getReservedBalance().subtract(amount).max(BigDecimal.ZERO));
            wallet.setBalance(wallet.getBalance().add(amount));
            walletRepository.save(wallet);
            throw new IllegalArgumentException("Please provide your Bank Account Number & IFSC or UPI ID to process withdrawal.");
        }

        String fundAccountId = razorpayXService.getOrCreateFundAccount(user, config);
        String contactId = config.getRazorpayContactId();

        // 5. Generate unique persisted reference ID and idempotency key
        String referenceId = "WDR_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        String idempotencyKey = UUID.randomUUID().toString();

        String destinationDetails = "vpa".equalsIgnoreCase(config.getAccountType())
                ? config.getVpaAddress()
                : (config.getAccountNumber() != null
                    ? maskAccountNumber(config.getAccountNumber()) + (config.getIfscCode() != null ? " (" + config.getIfscCode() + ")" : "")
                    : "Bank Account");

        // 6. Create Initial Withdrawal Record in PENDING state
        Withdrawal withdrawal = Withdrawal.builder()
                .user(user)
                .amount(amount)
                .currency("INR")
                .status(WithdrawalStatus.PENDING)
                .referenceId(referenceId)
                .idempotencyKey(idempotencyKey)
                .contactId(contactId)
                .fundAccountId(fundAccountId)
                .destinationType(config.getAccountType())
                .destinationDetails(destinationDetails)
                .build();

        withdrawal = withdrawalRepository.save(withdrawal);

        // 7. Record debit wallet ledger transaction for the reservation
        WalletTransaction walletTx = WalletTransaction.builder()
                .transactionId(referenceId)
                .amount(amount)
                .transactionType(TransactionType.DEBIT)
                .wallet(wallet)
                .build();
        walletTransactionService.createNewWalletTransaction(walletTx);

        // 8. Call Payout API
        try {
            RazorpayXPayoutResult payoutResult = razorpayXService.createPayout(withdrawal, fundAccountId, idempotencyKey);
            withdrawal.setPayoutId(payoutResult.getPayoutId());

            if ("processed".equalsIgnoreCase(payoutResult.getStatus())) {
                withdrawal.setStatus(WithdrawalStatus.COMPLETED);
                withdrawal.setProcessedAt(LocalDateTime.now());
                wallet.setReservedBalance(wallet.getReservedBalance().subtract(amount).max(BigDecimal.ZERO));
                walletRepository.save(wallet);
                log.info("Withdrawal immediately settled: id={}, ref={}", withdrawal.getId(), referenceId);
            } else {
                withdrawal.setStatus(WithdrawalStatus.PROCESSING);
                log.info("Withdrawal placed in PROCESSING state: id={}, ref={}", withdrawal.getId(), referenceId);
            }
        } catch (Exception e) {
            log.error("Failed to initiate payout for withdrawal {}: {}", withdrawal.getId(), e.getMessage());
            withdrawal.setStatus(WithdrawalStatus.FAILED);
            withdrawal.setFailureReason(e.getMessage());

            // Release reserved funds back to available balance on API failure
            wallet.setReservedBalance(wallet.getReservedBalance().subtract(amount).max(BigDecimal.ZERO));
            wallet.setBalance(wallet.getBalance().add(amount));
            walletRepository.save(wallet);

            WalletTransaction refundTx = WalletTransaction.builder()
                    .transactionId("REFUND_" + referenceId)
                    .amount(amount)
                    .transactionType(TransactionType.CREDIT)
                    .wallet(wallet)
                    .build();
            walletTransactionService.createNewWalletTransaction(refundTx);
        }

        withdrawal = withdrawalRepository.save(withdrawal);
        return mapToDTO(withdrawal);
    }

    @Override
    @Transactional(readOnly = true)
    public WithdrawalSummaryDTO getWithdrawalSummary(User user) {
        Wallet wallet = walletRepository.findByUser(user).orElse(null);
        BigDecimal withdrawable = wallet != null && wallet.getBalance() != null ? wallet.getBalance() : BigDecimal.ZERO;
        BigDecimal reserved = wallet != null && wallet.getReservedBalance() != null ? wallet.getReservedBalance() : BigDecimal.ZERO;

        List<Withdrawal> allWithdrawals = withdrawalRepository.findByUserOrderByCreatedAtDesc(user);

        BigDecimal totalWithdrawn = allWithdrawals.stream()
                .filter(w -> w.getStatus() == WithdrawalStatus.COMPLETED || w.getStatus() == WithdrawalStatus.SUCCESS)
                .map(Withdrawal::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingCount = allWithdrawals.stream()
                .filter(w -> w.getStatus() == WithdrawalStatus.PENDING || w.getStatus() == WithdrawalStatus.PROCESSING)
                .count();

        OwnerPayoutConfig config = ownerPayoutConfigRepository.findByUser(user).orElse(null);
        OwnerPayoutConfigDTO configDTO = config != null ? mapConfigToDTO(config) : null;

        List<WithdrawalResponseDTO> recent = allWithdrawals.stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return WithdrawalSummaryDTO.builder()
                .withdrawableBalance(withdrawable)
                .reservedBalance(reserved)
                .totalWithdrawn(totalWithdrawn)
                .pendingWithdrawalsCount(pendingCount)
                .payoutAccount(configDTO)
                .recentWithdrawals(recent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WithdrawalResponseDTO> getOwnerWithdrawals(User user) {
        return withdrawalRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OwnerPayoutConfigDTO savePayoutAccount(User user, OwnerPayoutConfigDTO dto) {
        OwnerPayoutConfig config = ownerPayoutConfigRepository.findByUser(user)
                .orElseGet(() -> OwnerPayoutConfig.builder().user(user).build());

        String accountType = dto.getAccountType() != null ? dto.getAccountType() : "bank_account";
        config.setAccountType(accountType);
        config.setBeneficiaryName(dto.getBeneficiaryName() != null && !dto.getBeneficiaryName().isBlank()
                ? dto.getBeneficiaryName().trim() : user.getName());

        if ("vpa".equalsIgnoreCase(accountType)) {
            if (dto.getVpaAddress() == null || dto.getVpaAddress().isBlank()) {
                throw new IllegalArgumentException("Please enter a valid UPI ID (e.g., username@bank).");
            }
            config.setVpaAddress(dto.getVpaAddress().trim());
        } else {
            if (dto.getAccountNumber() == null || dto.getAccountNumber().isBlank() ||
                dto.getIfscCode() == null || dto.getIfscCode().isBlank()) {
                throw new IllegalArgumentException("Please enter both Bank Account Number and IFSC Code.");
            }
            config.setAccountNumber(dto.getAccountNumber().trim());
            config.setIfscCode(dto.getIfscCode().trim().toUpperCase());
        }

        // Invalidate cached Razorpay fund account so a new one is provisioned
        config.setRazorpayFundAccountId(null);

        OwnerPayoutConfig saved = ownerPayoutConfigRepository.save(config);
        razorpayXService.getOrCreateFundAccount(user, saved);

        return mapConfigToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OwnerPayoutConfigDTO getPayoutAccount(User user) {
        OwnerPayoutConfig config = ownerPayoutConfigRepository.findByUser(user).orElse(null);
        if (config == null) {
            return null;
        }
        return mapConfigToDTO(config);
    }

    @Override
    @Transactional
    public void handlePayoutWebhook(String rawPayload, String signature) {
        log.info("Received RazorpayX Webhook payload. Verifying signature...");

        if (!razorpayXService.verifyWebhookSignature(rawPayload, signature)) {
            log.warn("Invalid RazorpayX webhook signature. Rejecting request.");
            throw new SecurityException("Webhook signature verification failed");
        }

        JSONObject json = new JSONObject(rawPayload);
        String event = json.optString("event");
        JSONObject payloadObj = json.optJSONObject("payload");
        if (payloadObj == null) {
            log.warn("Webhook has no payload object. Skipping.");
            return;
        }

        JSONObject payoutObj = payloadObj.optJSONObject("payout");
        if (payoutObj == null) {
            log.warn("Webhook payload has no payout entity. Skipping.");
            return;
        }

        JSONObject entity = payoutObj.optJSONObject("entity");
        if (entity == null) {
            log.warn("Webhook payout object has no entity. Skipping.");
            return;
        }

        String payoutId = entity.optString("id");
        String referenceId = entity.optString("reference_id");
        String status = entity.optString("status");

        log.info("Processing RazorpayX Webhook: event={}, payoutId={}, ref={}, status={}", event, payoutId, referenceId, status);

        Withdrawal withdrawal = null;
        if (payoutId != null && !payoutId.isBlank()) {
            withdrawal = withdrawalRepository.findByPayoutId(payoutId).orElse(null);
        }
        if (withdrawal == null && referenceId != null && !referenceId.isBlank()) {
            withdrawal = withdrawalRepository.findByReferenceId(referenceId).orElse(null);
        }

        if (withdrawal == null) {
            log.warn("No corresponding Withdrawal found for payoutId: {}, referenceId: {}", payoutId, referenceId);
            return;
        }

        // Handle Events Idempotently
        if ("payout.processed".equalsIgnoreCase(event) || "processed".equalsIgnoreCase(status)) {
            handlePayoutProcessed(withdrawal);
        } else if ("payout.reversed".equalsIgnoreCase(event) || "reversed".equalsIgnoreCase(status)) {
            String reason = entity.optString("error_description", "Payout reversed by banking system");
            handlePayoutReversed(withdrawal, reason);
        } else if ("payout.failed".equalsIgnoreCase(event) || "payout.rejected".equalsIgnoreCase(event) || "failed".equalsIgnoreCase(status) || "rejected".equalsIgnoreCase(status)) {
            String reason = entity.optString("error_description", "Payout failed or rejected");
            handlePayoutFailed(withdrawal, reason);
        } else if ("payout.initiated".equalsIgnoreCase(event) || "payout.queued".equalsIgnoreCase(event) || "processing".equalsIgnoreCase(status)) {
            if (withdrawal.getStatus() == WithdrawalStatus.PENDING) {
                withdrawal.setStatus(WithdrawalStatus.PROCESSING);
                withdrawalRepository.save(withdrawal);
            }
        }
    }

    private void handlePayoutProcessed(Withdrawal withdrawal) {
        if (withdrawal.getStatus() == WithdrawalStatus.COMPLETED || withdrawal.getStatus() == WithdrawalStatus.SUCCESS) {
            log.info("Withdrawal {} is already COMPLETED. Ignoring duplicate webhook.", withdrawal.getId());
            return;
        }

        Wallet wallet = walletRepository.findByUserWithLock(withdrawal.getUser()).orElse(null);
        if (wallet != null) {
            BigDecimal reserved = wallet.getReservedBalance() != null ? wallet.getReservedBalance() : BigDecimal.ZERO;
            wallet.setReservedBalance(reserved.subtract(withdrawal.getAmount()).max(BigDecimal.ZERO));
            walletRepository.save(wallet);
        }

        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawalRepository.save(withdrawal);
        log.info("Withdrawal {} successfully marked as COMPLETED via webhook.", withdrawal.getId());
    }

    private void handlePayoutReversed(Withdrawal withdrawal, String reason) {
        if (withdrawal.getStatus() == WithdrawalStatus.REVERSED) {
            log.info("Withdrawal {} is already REVERSED. Ignoring duplicate webhook.", withdrawal.getId());
            return;
        }

        Wallet wallet = walletRepository.findByUserWithLock(withdrawal.getUser()).orElse(null);
        if (wallet != null) {
            BigDecimal reserved = wallet.getReservedBalance() != null ? wallet.getReservedBalance() : BigDecimal.ZERO;
            wallet.setReservedBalance(reserved.subtract(withdrawal.getAmount()).max(BigDecimal.ZERO));
            wallet.setBalance(wallet.getBalance().add(withdrawal.getAmount()));
            walletRepository.save(wallet);

            WalletTransaction refundTx = WalletTransaction.builder()
                    .transactionId("REV_" + withdrawal.getReferenceId())
                    .amount(withdrawal.getAmount())
                    .transactionType(TransactionType.CREDIT)
                    .wallet(wallet)
                    .build();
            walletTransactionService.createNewWalletTransaction(refundTx);
        }

        withdrawal.setStatus(WithdrawalStatus.REVERSED);
        withdrawal.setFailureReason(reason);
        withdrawalRepository.save(withdrawal);
        log.info("Withdrawal {} marked as REVERSED and refunded to wallet. Reason: {}", withdrawal.getId(), reason);
    }

    private void handlePayoutFailed(Withdrawal withdrawal, String reason) {
        if (withdrawal.getStatus() == WithdrawalStatus.FAILED) {
            log.info("Withdrawal {} is already FAILED. Ignoring duplicate webhook.", withdrawal.getId());
            return;
        }

        Wallet wallet = walletRepository.findByUserWithLock(withdrawal.getUser()).orElse(null);
        if (wallet != null) {
            BigDecimal reserved = wallet.getReservedBalance() != null ? wallet.getReservedBalance() : BigDecimal.ZERO;
            wallet.setReservedBalance(reserved.subtract(withdrawal.getAmount()).max(BigDecimal.ZERO));
            wallet.setBalance(wallet.getBalance().add(withdrawal.getAmount()));
            walletRepository.save(wallet);

            WalletTransaction refundTx = WalletTransaction.builder()
                    .transactionId("FAIL_REF_" + withdrawal.getReferenceId())
                    .amount(withdrawal.getAmount())
                    .transactionType(TransactionType.CREDIT)
                    .wallet(wallet)
                    .build();
            walletTransactionService.createNewWalletTransaction(refundTx);
        }

        withdrawal.setStatus(WithdrawalStatus.FAILED);
        withdrawal.setFailureReason(reason);
        withdrawalRepository.save(withdrawal);
        log.info("Withdrawal {} marked as FAILED and refunded to wallet. Reason: {}", withdrawal.getId(), reason);
    }

    @Override
    @Transactional
    public WithdrawalResponseDTO simulatePayoutStatus(Long withdrawalId, String targetStatus) {
        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal not found with ID: " + withdrawalId));

        if ("COMPLETED".equalsIgnoreCase(targetStatus) || "SUCCESS".equalsIgnoreCase(targetStatus)) {
            handlePayoutProcessed(withdrawal);
        } else if ("REVERSED".equalsIgnoreCase(targetStatus)) {
            handlePayoutReversed(withdrawal, "Simulated banking reversal in Test Mode");
        } else if ("FAILED".equalsIgnoreCase(targetStatus)) {
            handlePayoutFailed(withdrawal, "Simulated banking payout failure in Test Mode");
        } else if ("PROCESSING".equalsIgnoreCase(targetStatus)) {
            withdrawal.setStatus(WithdrawalStatus.PROCESSING);
            withdrawalRepository.save(withdrawal);
        }

        return mapToDTO(withdrawal);
    }

    private WithdrawalResponseDTO mapToDTO(Withdrawal w) {
        return WithdrawalResponseDTO.builder()
                .id(w.getId())
                .referenceId(w.getReferenceId())
                .amount(w.getAmount())
                .currency(w.getCurrency())
                .status(w.getStatus() != null ? w.getStatus().name() : "PENDING")
                .payoutId(w.getPayoutId())
                .destinationType(w.getDestinationType())
                .destinationDetails(w.getDestinationDetails())
                .failureReason(w.getFailureReason())
                .createdAt(w.getCreatedAt())
                .processedAt(w.getProcessedAt())
                .build();
    }

    private OwnerPayoutConfigDTO mapConfigToDTO(OwnerPayoutConfig cfg) {
        return OwnerPayoutConfigDTO.builder()
                .accountType(cfg.getAccountType())
                .beneficiaryName(cfg.getBeneficiaryName())
                .accountNumber(cfg.getAccountNumber() != null ? maskAccountNumber(cfg.getAccountNumber()) : null)
                .ifscCode(cfg.getIfscCode())
                .vpaAddress(cfg.getVpaAddress())
                .razorpayContactId(cfg.getRazorpayContactId())
                .razorpayFundAccountId(cfg.getRazorpayFundAccountId())
                .build();
    }

    private String maskAccountNumber(String acc) {
        if (acc == null || acc.length() <= 4) return acc;
        return "••••••••" + acc.substring(acc.length() - 4);
    }
}
