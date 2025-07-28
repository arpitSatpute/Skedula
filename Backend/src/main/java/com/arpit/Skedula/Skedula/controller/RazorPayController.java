package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.RequestRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.dto.ResponseRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.services.RazorPayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/razorpay")
public class RazorPayController {

    private final RazorPayPaymentService razorPayPaymentService;

//    @PreAuthorize("@razorPayPaymentService.isOwnerOfPayment(#email)")
    @PostMapping(value = "/pay", produces = "application/json")
    public ResponseRazorPayAmountDTO pay(@RequestBody RequestRazorPayAmountDTO razorPayAmountDTO) {
        return razorPayPaymentService.createRazorpayPaymentOrder(razorPayAmountDTO);
    }


}
