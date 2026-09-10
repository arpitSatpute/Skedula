package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.advices.ApiResponse;
import com.arpit.Skedula.Skedula.dto.OwnerPayoutConfigDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalRequestDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalResponseDTO;
import com.arpit.Skedula.Skedula.dto.WithdrawalSummaryDTO;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalController {

    private final WithdrawalService withdrawalService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WithdrawalResponseDTO>> requestWithdrawal(
            @Valid @RequestBody WithdrawalRequestDTO request) {
        User owner = getAuthenticatedUser();
        WithdrawalResponseDTO response = withdrawalService.requestWithdrawal(owner, request);
        return new ResponseEntity<>(new ApiResponse<>(response), HttpStatus.CREATED);
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WithdrawalSummaryDTO>> getWithdrawalSummary() {
        User owner = getAuthenticatedUser();
        WithdrawalSummaryDTO summary = withdrawalService.getWithdrawalSummary(owner);
        return ResponseEntity.ok(new ApiResponse<>(summary));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WithdrawalResponseDTO>>> getOwnerWithdrawals() {
        User owner = getAuthenticatedUser();
        List<WithdrawalResponseDTO> list = withdrawalService.getOwnerWithdrawals(owner);
        return ResponseEntity.ok(new ApiResponse<>(list));
    }

    @PostMapping("/account")
    public ResponseEntity<ApiResponse<OwnerPayoutConfigDTO>> savePayoutAccount(
            @RequestBody OwnerPayoutConfigDTO dto) {
        User owner = getAuthenticatedUser();
        OwnerPayoutConfigDTO saved = withdrawalService.savePayoutAccount(owner, dto);
        return ResponseEntity.ok(new ApiResponse<>(saved));
    }

    @GetMapping("/account")
    public ResponseEntity<ApiResponse<OwnerPayoutConfigDTO>> getPayoutAccount() {
        User owner = getAuthenticatedUser();
        OwnerPayoutConfigDTO account = withdrawalService.getPayoutAccount(owner);
        return ResponseEntity.ok(new ApiResponse<>(account));
    }

    @PostMapping("/{id}/simulate")
    public ResponseEntity<ApiResponse<WithdrawalResponseDTO>> simulateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        WithdrawalResponseDTO updated = withdrawalService.simulatePayoutStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(updated));
    }
}
