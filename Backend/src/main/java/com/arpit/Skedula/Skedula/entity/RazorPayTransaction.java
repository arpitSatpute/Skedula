package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RazorPayTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "razorpay_amount_id", nullable = false)
    private RazorpayAmount razorpay_amount; // Ensure this matches the `mappedBy` in RazorpayAmount

    private String transactionId;

    private BigDecimal amount;

    private String razorpayOrderStatus;
}