package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseWalletTransactionDTO {

    private Long id;
    private BigDecimal amount;
    private TransactionType transactionType;
    private String transactionId;
    private LocalDateTime timeStamp;

}
