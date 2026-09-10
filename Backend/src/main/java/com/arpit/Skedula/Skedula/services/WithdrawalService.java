package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.OwnerPayoutConfigDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalSummaryDTO;
import com.arpit.Skedula.Skedula.entity.User;

import java.util.List;

public interface WithdrawalService {

    WithdrawalResponseDTO requestWithdrawal(User owner, WithdrawalRequestDTO request);

    WithdrawalSummaryDTO getWithdrawalSummary(User owner);

    List<WithdrawalResponseDTO> getOwnerWithdrawals(User owner);

    OwnerPayoutConfigDTO savePayoutAccount(User owner, OwnerPayoutConfigDTO dto);

    OwnerPayoutConfigDTO getPayoutAccount(User owner);

    void handlePayoutWebhook(String rawPayload, String signature);

    WithdrawalResponseDTO simulatePayoutStatus(Long withdrawalId, String status);
}
