package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WithdrawalSummaryDTO {
    private BigDecimal withdrawableBalance;
    private BigDecimal reservedBalance;
    private BigDecimal totalWithdrawn;
    private Long pendingWithdrawalsCount;
    private OwnerPayoutConfigDTO payoutAccount;
    private List<WithdrawalResponseDTO> recentWithdrawals;
}
