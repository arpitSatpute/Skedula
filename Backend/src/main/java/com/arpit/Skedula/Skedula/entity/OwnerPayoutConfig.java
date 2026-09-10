package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "owner_payout_config")
public class OwnerPayoutConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String razorpayContactId;

    private String razorpayFundAccountId;

    @Builder.Default
    private String accountType = "bank_account"; // "bank_account" or "vpa"

    private String beneficiaryName;

    private String accountNumber;

    private String ifscCode;

    private String vpaAddress;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
