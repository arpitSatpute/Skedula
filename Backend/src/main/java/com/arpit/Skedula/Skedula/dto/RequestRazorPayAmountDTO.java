package com.arpit.Skedula.Skedula.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RequestRazorPayAmountDTO {

    private BigDecimal amount;
    private String currency;
    private String email;

}
