package com.arpit.Skedula.Skedula.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WithdrawalRequestDTO {

    @NotNull(message = "Withdrawal amount is required")
    @DecimalMin(value = "1.00", message = "Withdrawal amount must be at least ₹1.00")
    private BigDecimal amount;

    private String destinationType; // "bank_account" or "vpa"
    private String destinationDetails; // Account number or VPA address
    private String ifscCode;
    private String beneficiaryName;
}
