package com.arpit.Skedula.Skedula.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseWalletDTO {

    private Long id;
    private UserDTO user;
    private BigDecimal balance;
    private List<ResponseWalletTransactionDTO> transactions;
}
