package com.arpit.Skedula.Skedula.utils;

import com.arpit.Skedula.Skedula.entity.Otp;
import com.arpit.Skedula.Skedula.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public String generateOtp(String key) {
        String otp = String.valueOf(new Random().nextInt(9000) + 1000); // Generates a 4-digit OTP
        long expirationTime = System.currentTimeMillis() + 300000; // OTP valid for 5 minutes

        Otp otpEntity = new Otp();
        otpEntity.setKey(key);
        otpEntity.setOtp(otp);
        otpEntity.setExpirationTime(expirationTime);

        otpRepository.save(otpEntity);

        // Schedule removal after 5 minutes
        scheduler.schedule(() -> otpRepository.deleteById(key), 5, TimeUnit.MINUTES);

        return otp;
    }

    public boolean validateOtp(String key, String inputOtp) {
        Otp otpEntity = otpRepository.findByKey(key);
        if (otpEntity == null) {
            return false;
        }

        boolean isValid = otpEntity.getOtp().equals(inputOtp) &&
                System.currentTimeMillis() <= otpEntity.getExpirationTime();

        if (isValid) {
            otpRepository.delete(otpEntity); // Clear OTP after validation
        }

        return isValid;
    }
}