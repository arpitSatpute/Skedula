package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.ResponseWalletTransactionDTO;
import com.arpit.Skedula.Skedula.entity.WalletTransaction;
import com.arpit.Skedula.Skedula.repository.WalletTransactionRepository;
import com.arpit.Skedula.Skedula.services.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
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

    @Override
    public List<ResponseWalletTransactionDTO> convertToTransactionDTOs(List<WalletTransaction> transactions) {
        List<ResponseWalletTransactionDTO> responseWalletTransactionDTOs = new ArrayList<>();
        for(WalletTransaction walletTransaction : transactions){
            ResponseWalletTransactionDTO responseWalletTransactionDTO = new ResponseWalletTransactionDTO();
            responseWalletTransactionDTO.setId(walletTransaction.getId());
            responseWalletTransactionDTO.setTransactionId(walletTransaction.getTransactionId());
            responseWalletTransactionDTO.setAmount(walletTransaction.getAmount());
            responseWalletTransactionDTO.setTransactionType(walletTransaction.getTransactionType());
            responseWalletTransactionDTO.setTimeStamp(walletTransaction.getTimeStamp());
            responseWalletTransactionDTOs.add(responseWalletTransactionDTO);

        }
        return responseWalletTransactionDTOs;

    }

}
