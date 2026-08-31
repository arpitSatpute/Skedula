package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.ResponseWalletDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/get")
    public ResponseEntity<ResponseWalletDTO> getWallet() {
        return ResponseEntity.ok(walletService.getWallet());
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WithdrawalResponseDTO> withdraw(@RequestBody WithdrawalRequestDTO request) {
        return ResponseEntity.ok(walletService.requestWithdrawal(request));
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<List<WithdrawalResponseDTO>> getWithdrawals() {
        return ResponseEntity.ok(walletService.getUserWithdrawals());
    }
}
