package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.utils.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/generate")
    public String generateOtp(@RequestParam String key) {
        return otpService.generateOtp(key);
    }

    @PostMapping("/validate")
    public boolean validateOtp(@RequestParam String key, @RequestParam String inputOtp) {
        return otpService.validateOtp(key, inputOtp);
    }
}