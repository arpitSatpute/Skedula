package com.arpit.Skedula.Skedula.dto;


import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseRazorPayAmountDTO {

    private BigDecimal amount;
    private String currency;
    private String receiptOrderId;
    private String razorpayOrderId;

}
