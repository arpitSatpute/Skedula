package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WithdrawalResponseDTO {
    private Long id;
    private String referenceId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String destinationType;
    private String destinationDetails;
    private String payoutId;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
