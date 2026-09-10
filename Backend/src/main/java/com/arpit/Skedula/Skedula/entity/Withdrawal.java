package com.arpit.Skedula.Skedula.entity;

import com.arpit.Skedula.Skedula.entity.enums.WithdrawalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Withdrawal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WithdrawalStatus status;

    private String payoutId;
    
    @Column(unique = true)
    private String referenceId;

    @Column(unique = true)
    private String idempotencyKey;

    private String contactId;
    private String fundAccountId;
    private String destinationType; // UPI or BANK_ACCOUNT
    private String destinationDetails; // upi id or masked account
    private String failureReason;

    private LocalDateTime processedAt;

    @CurrentTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
