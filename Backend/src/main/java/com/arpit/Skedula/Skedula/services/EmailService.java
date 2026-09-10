package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.entity.Appointment;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public interface EmailService {

    void sendEmail(String to, String sub, String body);

    void sendHtmlEmail(String to, String subject, String htmlBody);

    void sendAppointmentBookedAlerts(Appointment appointment);

    void sendAppointmentApprovedAlerts(Appointment appointment);

    void sendAppointmentRejectedAlerts(Appointment appointment);

    void sendAppointmentRescheduledAlerts(Appointment appointment, LocalDateTime oldDateTime);

    void sendAppointmentCancelledAlerts(Appointment appointment, String cancelledBy, BigDecimal refundAmount, BigDecimal cancellationFee);

    void sendAppointmentCompletedAlerts(Appointment appointment, BigDecimal netReleasedAmount);
}
