package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletTransactionDTO {

    private Long id;
    private BigDecimal amount;
    private TransactionType transactionType;
    private String transactionId;
    private WalletDTO wallet;
    private LocalDateTime timeStamp;

}
