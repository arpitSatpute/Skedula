package com.arpit.Skedula.Skedula.services;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {

    void sendEmail(String to, String sub, String body);

}
