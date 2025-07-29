package com.arpit.Skedula.Skedula.dto;


import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RequestRazorpayPaymentVerifyDTO {

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
    private String email;


}
