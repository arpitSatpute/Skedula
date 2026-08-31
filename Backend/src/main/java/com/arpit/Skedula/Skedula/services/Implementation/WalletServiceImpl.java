package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.ResponseWalletDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.entity.enums.WithdrawalStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.repository.WithdrawalRepository;
import com.arpit.Skedula.Skedula.services.WalletService;
import com.arpit.Skedula.Skedula.services.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionService walletTransactionService;
    private final UserRepository userRepository;
    private final WithdrawalRepository withdrawalRepository;

    @Override
    public Wallet createWallet(User user) {
        Wallet wallet = new Wallet().builder()
                .balance(BigDecimal.ZERO)
                .user(user)
                .transactions(null)
                .build();

        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet addMoney(User user, BigDecimal amount, String transactionId, Appointment appointment) {
        Wallet wallet = findByUser(user);
        wallet.setBalance(wallet.getBalance().add(amount));
        WalletTransaction walletTransaction =  WalletTransaction.builder()
                .transactionId(transactionId)
                .amount(amount)
                .transactionType(TransactionType.CREDIT)
                .wallet(wallet)
                .appointment(appointment)
                .build();

        walletTransactionService.createNewWalletTransaction(walletTransaction);

        if (wallet.getTransactions() != null) {
            wallet.getTransactions().add(walletTransaction);
        }

        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet deductMoney(User user, BigDecimal amount, String transactionId, Appointment appointment) {
        Wallet wallet = findByUser(user);

        if(wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in wallet for user: " + user.getId());
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .transactionId(transactionId)
                .amount(amount)
                .transactionType(TransactionType.DEBIT)
                .wallet(wallet)
                .appointment(appointment)
                .build();

        walletTransactionService.createNewWalletTransaction(walletTransaction);

        if (wallet.getTransactions() != null) {
            wallet.getTransactions().add(walletTransaction);
        }

        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public WithdrawalResponseDTO requestWithdrawal(WithdrawalRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        BigDecimal minWithdrawal = BigDecimal.valueOf(100);
        if (request.getAmount() == null || request.getAmount().compareTo(minWithdrawal) < 0) {
            throw new IllegalArgumentException("Minimum withdrawal amount is ₹100.00");
        }

        Wallet wallet = findByUser(user);
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient wallet balance for this withdrawal request.");
        }

        // Deduct money from wallet
        String txnId = "WDRAW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        deductMoney(user, request.getAmount(), txnId, null);

        // Simulate or execute RazorpayX Payout in sandbox/test mode
        String payoutId = "pout_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        Withdrawal withdrawal = Withdrawal.builder()
                .user(user)
                .amount(request.getAmount())
                .status(WithdrawalStatus.SUCCESS) // Completed payout in test sandbox
                .payoutId(payoutId)
                .fundAccountId("fa_test_" + UUID.randomUUID().toString().substring(0, 10))
                .destinationType(request.getDestinationType() != null ? request.getDestinationType().toUpperCase() : "UPI")
                .destinationDetails(request.getDestinationDetails() != null ? request.getDestinationDetails() : "Account Linked")
                .build();

        Withdrawal saved = withdrawalRepository.save(withdrawal);

        return WithdrawalResponseDTO.builder()
                .id(saved.getId())
                .amount(saved.getAmount())
                .status(saved.getStatus().name())
                .destinationType(saved.getDestinationType())
                .destinationDetails(saved.getDestinationDetails())
                .payoutId(saved.getPayoutId())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<WithdrawalResponseDTO> getUserWithdrawals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return withdrawalRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(w -> WithdrawalResponseDTO.builder()
                        .id(w.getId())
                        .amount(w.getAmount())
                        .status(w.getStatus().name())
                        .destinationType(w.getDestinationType())
                        .destinationDetails(w.getDestinationDetails())
                        .payoutId(w.getPayoutId())
                        .failureReason(w.getFailureReason())
                        .createdAt(w.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Wallet getWalletByUserId(Long id) {
        return walletRepository.findByUser_Id(id)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user ID: " + id));
    }

    @Override
    public Wallet findByUser(User user) {
        return walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + user.getId()));
    }

    @Override
    public Wallet findWalletById(Long id) {
        return walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wallet not found with ID: " + id));
    }

    @Override
    public ResponseWalletDTO getWallet() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        Wallet wallet = findByUser(user);
        return convertToResponseDTO(wallet, user);
    }

    private ResponseWalletDTO convertToResponseDTO(Wallet wallet, User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setName(user.getName());
        userDTO.setRoles(user.getRoles());

        ResponseWalletDTO responseWalletDTO = new ResponseWalletDTO();
        responseWalletDTO.setId(wallet.getId());
        responseWalletDTO.setUser(userDTO);
        responseWalletDTO.setBalance(wallet.getBalance());
        responseWalletDTO.setTransactions(walletTransactionService.convertToTransactionDTOs(wallet.getTransactions()));
        return responseWalletDTO;
    }
}
