package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancellationPreviewDTO {
    private boolean isLateCancellation;
    private BigDecimal totalAmount;
    private BigDecimal cancellationFee;
    private BigDecimal refundAmount;
    private Integer cutoffMinutes;
    private Double feePercentage;
    private Long minutesRemaining;
}
