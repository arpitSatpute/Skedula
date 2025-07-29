package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RazorpayAmount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    private String currency;

    private String receiptOrderId;

    private String razorpayOrderId;

    @OneToMany(mappedBy = "razorpay_amount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RazorPayTransaction> transaction;


}