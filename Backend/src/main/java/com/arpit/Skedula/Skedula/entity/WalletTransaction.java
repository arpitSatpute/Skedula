package com.arpit.Skedula.Skedula.entity;


import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;


    private String transactionId;

    @OneToOne
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    private Wallet wallet;

    @CurrentTimestamp
    private LocalDateTime timeStamp;

    @Override
    public String toString() {
        return "WalletTransaction{" +
                "id=" + id +
                ", amount=" + amount +
                ", transactionType=" + transactionType +
                ", walletId=" + (wallet != null ? wallet.getId() : null) +
                '}';
    }


}
