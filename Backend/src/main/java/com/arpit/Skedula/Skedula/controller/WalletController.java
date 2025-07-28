package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.ResponseWalletDTO;
import com.arpit.Skedula.Skedula.dto.WalletDTO;
import com.arpit.Skedula.Skedula.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/get")
    public ResponseEntity<ResponseWalletDTO> getWallet() {

        return ResponseEntity.ok(walletService.getWallet());

    }

}
