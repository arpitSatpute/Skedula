package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.RequestRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.dto.RequestRazorpayPaymentVerifyDTO;
import com.arpit.Skedula.Skedula.dto.ResponseRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.services.RazorPayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

/**
 * RazorPay payment endpoints.
 * Restricted to ROLE_CUSTOMER only — only customers initiate payments.
 * Ownership of the payment is validated server-side by the payment service
 * using the authenticated user's JWT identity.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/razorpay")
@Secured("ROLE_CUSTOMER")
public class RazorPayController {

    private final RazorPayPaymentService razorPayPaymentService;

    @PostMapping(value = "/pay", produces = "application/json")
    public ResponseRazorPayAmountDTO pay(@RequestBody RequestRazorPayAmountDTO razorPayAmountDTO) {
        return razorPayPaymentService.createRazorpayPaymentOrder(razorPayAmountDTO);
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPayment(@RequestBody RequestRazorpayPaymentVerifyDTO razorpayPaymentVerifyDTO) {
        return ResponseEntity.ok(razorPayPaymentService.verifyRazorpayPayment(razorpayPaymentVerifyDTO));
    }
}
