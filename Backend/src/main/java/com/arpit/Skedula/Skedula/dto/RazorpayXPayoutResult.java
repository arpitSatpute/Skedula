package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RazorpayXPayoutResult {
    private String payoutId;
    private String status;
    private String failureReason;
    private String referenceId;
    private String mode;
    private Long amountInPaise;
}
