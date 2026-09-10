package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OwnerPayoutConfigDTO {
    private String accountType; // "bank_account" or "vpa"
    private String beneficiaryName;
    private String accountNumber;
    private String ifscCode;
    private String vpaAddress;
    private String razorpayContactId;
    private String razorpayFundAccountId;
}
