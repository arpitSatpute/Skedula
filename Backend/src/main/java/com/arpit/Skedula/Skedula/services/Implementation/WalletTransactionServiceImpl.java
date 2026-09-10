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
        if (transactions == null) {
            return new ArrayList<>();
        }
        List<ResponseWalletTransactionDTO> responseWalletTransactionDTOs = new ArrayList<>();
        for (WalletTransaction walletTransaction : transactions) {
            if (walletTransaction == null) continue;
            ResponseWalletTransactionDTO dto = new ResponseWalletTransactionDTO();
            dto.setId(walletTransaction.getId());
            dto.setTransactionId(walletTransaction.getTransactionId());
            dto.setAmount(walletTransaction.getAmount());
            dto.setTransactionType(walletTransaction.getTransactionType());
            dto.setTimeStamp(walletTransaction.getTimeStamp());
            if (walletTransaction.getAppointment() != null) {
                dto.setAppointmentId(walletTransaction.getAppointment().getId());
                if (walletTransaction.getAppointment().getServiceOffered() != null) {
                    dto.setServiceName(walletTransaction.getAppointment().getServiceOffered().getName());
                }
            }
            responseWalletTransactionDTOs.add(dto);
        }
        return responseWalletTransactionDTOs;
    }

}
