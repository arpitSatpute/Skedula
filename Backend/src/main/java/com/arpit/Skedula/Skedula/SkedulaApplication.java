package com.arpit.Skedula.Skedula;

import com.arpit.Skedula.Skedula.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
//@RequiredArgsConstructor
public class SkedulaApplication {

//	private final EmailService emailService;

	public static void main(String[] args) {
		SpringApplication.run(SkedulaApplication.class, args);
	}

//	@EventListener(ApplicationReadyEvent.class)
//	public void sendTestEmail() {
//		emailService.sendEmail("arpitsatpute3964@gmail.com", "Email Service Testing", "This is a test email from Skedula application. If you received this email, the email service is working correctly.");
//	}
}
