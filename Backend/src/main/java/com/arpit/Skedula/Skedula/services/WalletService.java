package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.ResponseWalletDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Wallet;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface WalletService {

    Wallet createWallet(User user);

    Wallet addMoney(User user, BigDecimal amount, String transactionId, Appointment appointment);

    Wallet deductMoney(User user, BigDecimal amount, String transactionId, Appointment appointment);

    Wallet findByUser(User user);

    Wallet findWalletById(Long id);

    Wallet getWalletByUserId(Long id);

    ResponseWalletDTO getWallet();

    WithdrawalResponseDTO requestWithdrawal(WithdrawalRequestDTO request);

    List<WithdrawalResponseDTO> getUserWithdrawals();
}
