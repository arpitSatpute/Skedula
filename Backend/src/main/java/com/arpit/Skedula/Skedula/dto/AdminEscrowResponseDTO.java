package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminEscrowResponseDTO {

    private BigDecimal totalEscrowBalance;        // Live funds currently held in escrow
    private BigDecimal totalReleasedToBusinesses;  // Funds successfully settled after completed appointments
    private BigDecimal totalRefundedToCustomers;   // Funds refunded due to cancellations/rejections
    private BigDecimal totalPlatformFeesEarned;    // Cumulative 5% platform fee
    private long activeHoldsCount;                 // Number of appointments currently held in escrow
    private List<EscrowLedgerItemDTO> ledger;      // Comprehensive ledger entries
}
