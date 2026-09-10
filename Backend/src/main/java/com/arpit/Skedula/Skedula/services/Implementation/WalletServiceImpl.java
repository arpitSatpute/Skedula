package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.ResponseWalletDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.repository.WalletTransactionRepository;
import com.arpit.Skedula.Skedula.services.WalletService;
import com.arpit.Skedula.Skedula.services.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletTransactionService walletTransactionService;
    private final UserRepository userRepository;

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
    @Transactional(readOnly = true)
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

        // Fetch real, complete list of wallet transactions ordered by latest first
        List<WalletTransaction> transactions = walletTransactionRepository.findByWallet_IdOrderByTimeStampDesc(wallet.getId());
        responseWalletDTO.setTransactions(walletTransactionService.convertToTransactionDTOs(transactions));
        return responseWalletDTO;
    }
}
