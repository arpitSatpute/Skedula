package com.arpit.Skedula.Skedula.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawalRequestDTO {
    private BigDecimal amount;
    private String destinationType; // UPI or BANK
    private String destinationDetails; // upi id or account number
    private String ifscCode;
}
