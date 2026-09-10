package com.arpit.Skedula.Skedula.rabbitmq;

import com.arpit.Skedula.Skedula.dto.EmailMessageDto;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:skedula.service@gmail.com}")
    private String fromEmail;

    @RabbitListener(queues = "${rabbitmq.email.queue:skedula.email.queue}")
    public void consumeEmailMessage(EmailMessageDto emailMessage) {
        if (emailMessage == null || emailMessage.getTo() == null || emailMessage.getTo().isBlank()) {
            log.warn("Received empty or invalid email message from RabbitMQ queue.");
            return;
        }

        log.info("Processing email from RabbitMQ for recipient: {}, Subject: '{}'", emailMessage.getTo(), emailMessage.getSubject());

        try {
            if (emailMessage.isHtml()) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                helper.setFrom(fromEmail, "Skedula Notifications");
                helper.setTo(emailMessage.getTo());
                helper.setSubject(emailMessage.getSubject());
                helper.setText(emailMessage.getBody(), true);
                mailSender.send(mimeMessage);
                log.info("Successfully sent HTML email via RabbitMQ consumer to: {}", emailMessage.getTo());
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(emailMessage.getTo());
                message.setSubject(emailMessage.getSubject());
                message.setText(emailMessage.getBody());
                mailSender.send(message);
                log.info("Successfully sent plain text email via RabbitMQ consumer to: {}", emailMessage.getTo());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {} via RabbitMQ consumer: {}", emailMessage.getTo(), e.getMessage());
        }
    }
}
