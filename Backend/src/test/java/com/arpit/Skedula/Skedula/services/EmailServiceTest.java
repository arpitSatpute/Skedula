package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.EmailMessageDto;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.rabbitmq.EmailConsumer;
import com.arpit.Skedula.Skedula.services.Implementation.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Properties;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @InjectMocks
    private EmailConsumer emailConsumer;

    private Appointment sampleAppointment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "skedula.service@gmail.com");
        ReflectionTestUtils.setField(emailService, "emailExchange", "skedula.email.exchange");
        ReflectionTestUtils.setField(emailService, "emailRoutingKey", "skedula.email.routingkey");

        ReflectionTestUtils.setField(emailConsumer, "fromEmail", "skedula.service@gmail.com");

        User customerUser = new User();
        customerUser.setId(10L);
        customerUser.setName("Jane Doe");
        customerUser.setEmail("jane.customer@example.com");

        Customer customer = new Customer();
        customer.setId(100L);
        customer.setUser(customerUser);

        User ownerUser = new User();
        ownerUser.setId(20L);
        ownerUser.setName("Bob Owner");
        ownerUser.setEmail("bob.owner@example.com");

        Business business = new Business();
        business.setId(200L);
        business.setName("Zenith Spa & Wellness");
        business.setEmail("contact@zenithspa.com");
        business.setAddress("123 Serenity Blvd");
        business.setCity("Metropolis");
        business.setOwner(ownerUser);

        BusinessServiceOffered service = new BusinessServiceOffered();
        service.setId(300L);
        service.setName("Deep Tissue Massage");
        service.setPrice(new BigDecimal("1200.00"));
        service.setDuration(60);
        service.setBusiness(business);

        sampleAppointment = new Appointment();
        sampleAppointment.setId(501L);
        sampleAppointment.setAppointmentId("APPT-501-TEST");
        sampleAppointment.setAppointmentDateTime(LocalDateTime.of(2026, 9, 15, 14, 30));
        sampleAppointment.setAppointmentStatus(AppointmentStatus.PENDING);
        sampleAppointment.setBookedBy(customer);
        sampleAppointment.setBusiness(business);
        sampleAppointment.setServiceOffered(service);
        sampleAppointment.setNotes("First time visiting.");

        lenient().when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void testSendAppointmentBookedAlertsPublishesToRabbitMq() {
        emailService.sendAppointmentBookedAlerts(sampleAppointment);
        // Expect 2 messages published to RabbitMQ (customer + business)
        verify(rabbitTemplate, times(2)).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testSendAppointmentApprovedAlertsPublishesToRabbitMq() {
        emailService.sendAppointmentApprovedAlerts(sampleAppointment);
        verify(rabbitTemplate, times(2)).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testSendAppointmentRejectedAlertsPublishesToRabbitMq() {
        emailService.sendAppointmentRejectedAlerts(sampleAppointment);
        verify(rabbitTemplate, atLeastOnce()).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testSendAppointmentRescheduledAlertsPublishesToRabbitMq() {
        LocalDateTime oldDate = LocalDateTime.of(2026, 9, 14, 10, 0);
        emailService.sendAppointmentRescheduledAlerts(sampleAppointment, oldDate);
        verify(rabbitTemplate, times(2)).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testSendAppointmentCancelledAlertsPublishesToRabbitMq() {
        emailService.sendAppointmentCancelledAlerts(sampleAppointment, "Customer", new BigDecimal("1200.00"), BigDecimal.ZERO);
        verify(rabbitTemplate, times(2)).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testSendAppointmentCompletedAlertsPublishesToRabbitMq() {
        emailService.sendAppointmentCompletedAlerts(sampleAppointment, new BigDecimal("1140.00"));
        verify(rabbitTemplate, times(2)).convertAndSend(eq("skedula.email.exchange"), eq("skedula.email.routingkey"), any(EmailMessageDto.class));
    }

    @Test
    void testConsumerDispatchesEmailSuccessfully() {
        EmailMessageDto message = EmailMessageDto.builder()
                .to("recipient@example.com")
                .subject("Test Notification")
                .body("<p>Hello World</p>")
                .isHtml(true)
                .build();

        emailConsumer.consumeEmailMessage(message);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testFallbackDirectDispatchWhenRabbitMqFails() {
        doThrow(new RuntimeException("RabbitMQ connection down"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        emailService.sendHtmlEmail("direct@example.com", "Fallback Test", "<b>Content</b>");
        // Fallback should directly send via mailSender
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
