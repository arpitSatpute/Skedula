package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.services.WithdrawalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/razorpayx")
@RequiredArgsConstructor
public class RazorpayXWebhookController {

    private final WithdrawalService withdrawalService;

    @PostMapping
    public ResponseEntity<?> receiveRazorpayXWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        log.info("Received RazorpayX Payout Webhook call (signature length: {})", signature != null ? signature.length() : 0);

        try {
            withdrawalService.handlePayoutWebhook(rawPayload, signature);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook processed successfully"));
        } catch (SecurityException e) {
            log.warn("Unauthorized webhook attempt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
