package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.entity.WalletTransaction;
import com.arpit.Skedula.Skedula.repository.WalletTransactionRepository;
import com.arpit.Skedula.Skedula.services.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletTransactionServiceImpl implements WalletTransactionService {


    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    public void createNewWalletTransaction(WalletTransaction walletTransaction) {
        walletTransactionRepository.save(walletTransaction);
    }

    @Override
    public Optional<WalletTransaction> findWalletTransactionByTransactionId(String transactionId) {
        return walletTransactionRepository.findByTransactionId(transactionId);
    }

}
