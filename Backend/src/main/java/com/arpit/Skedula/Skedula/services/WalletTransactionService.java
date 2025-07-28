package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.ResponseWalletTransactionDTO;
import com.arpit.Skedula.Skedula.entity.WalletTransaction;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface WalletTransactionService {

    void createNewWalletTransaction(WalletTransaction walletTransaction);

    Optional<WalletTransaction> findWalletTransactionByTransactionId(String transactionId);

    List<ResponseWalletTransactionDTO> convertToTransactionDTOs(List<WalletTransaction> transactions);
}

