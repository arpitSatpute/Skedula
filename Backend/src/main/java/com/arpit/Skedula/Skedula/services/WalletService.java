package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Wallet;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public interface WalletService {

    Wallet createWallet(User user);

    Wallet addMoney(User user, BigDecimal amount, String transactionId, Appointment appointment);

    Wallet deductMoney(User user, BigDecimal amount, String transactionId, Appointment appointment);

    Wallet findByUser(User user);

    Wallet findWalletById(Long id);

    Wallet getWalletByUserId(Long id);


}
