package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.EmailMessageDto;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.services.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final RabbitTemplate rabbitTemplate;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:skedula.service@gmail.com}")
    private String fromEmail;

    @Value("${rabbitmq.email.exchange:skedula.email.exchange}")
    private String emailExchange;

    @Value("${rabbitmq.email.routingkey:skedula.email.routingkey}")
    private String emailRoutingKey;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' hh:mm a");

    @Override
    @Async
    public void sendEmail(String to, String sub, String body) {
        if (to == null || to.isBlank()) return;
        EmailMessageDto messageDto = EmailMessageDto.builder()
                .to(to)
                .subject(sub)
                .body(body)
                .isHtml(false)
                .build();
        publishToRabbitMqOrFallback(messageDto);
    }

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (to == null || to.isBlank()) return;
        EmailMessageDto messageDto = EmailMessageDto.builder()
                .to(to)
                .subject(subject)
                .body(htmlBody)
                .isHtml(true)
                .build();
        publishToRabbitMqOrFallback(messageDto);
    }

    private void publishToRabbitMqOrFallback(EmailMessageDto messageDto) {
        try {
            rabbitTemplate.convertAndSend(emailExchange, emailRoutingKey, messageDto);
            log.info("Queued email to RabbitMQ [Exchange: {}, Key: {}] for: {}",
                    emailExchange, emailRoutingKey, messageDto.getTo());
        } catch (Exception e) {
            log.warn("RabbitMQ publish failed for recipient {}. Executing direct fallback delivery. Reason: {}",
                    messageDto.getTo(), e.getMessage());
            dispatchDirectEmail(messageDto);
        }
    }

    private void dispatchDirectEmail(EmailMessageDto messageDto) {
        try {
            if (messageDto.isHtml()) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                helper.setFrom(fromEmail, "Skedula Notifications");
                helper.setTo(messageDto.getTo());
                helper.setSubject(messageDto.getSubject());
                helper.setText(messageDto.getBody(), true);
                mailSender.send(mimeMessage);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(messageDto.getTo());
                message.setSubject(messageDto.getSubject());
                message.setText(messageDto.getBody());
                mailSender.send(message);
            }
            log.info("Direct email fallback dispatch succeeded for: {}", messageDto.getTo());
        } catch (Exception ex) {
            log.error("Direct email fallback dispatch also failed for {}: {}", messageDto.getTo(), ex.getMessage());
        }
    }

    // ==========================================
    // 1. APPOINTMENT BOOKED / REQUESTED ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentBookedAlerts(Appointment appointment) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            User ownerUser = business != null ? business.getOwner() : null;
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";

            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";
            String businessEmail = business != null && business.getEmail() != null ? business.getEmail() : (ownerUser != null ? ownerUser.getEmail() : null);
            String ownerEmail = ownerUser != null ? ownerUser.getEmail() : null;

            String serviceName = service != null ? service.getName() : "Appointment Service";
            BigDecimal price = service != null && service.getPrice() != null ? service.getPrice() : BigDecimal.ZERO;
            String formattedDateTime = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Scheduled Date TBD";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            // 1A. Customer Email
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Appointment Requested: " + serviceName + " at " + businessName + " [" + appointmentId + "]";
                String custHtml = buildEmailCard(
                        "Appointment Request Received",
                        "Hi " + customerName + ", your appointment request has been submitted to " + businessName + ". Your funds are securely held in Escrow while the business reviews your requested slot.",
                        "#f59e0b",
                        "Pending Provider Confirmation",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"Requested Schedule", formattedDateTime},
                                {"Duration", (service != null && service.getDuration() != null ? service.getDuration() : 30) + " mins"},
                                {"Total Escrow Amount", "₹" + price},
                                {"Provider Business", businessName},
                                {"Address / Location", business != null && business.getAddress() != null ? business.getAddress() + ", " + (business.getCity() != null ? business.getCity() : "") : "N/A"},
                                {"Special Notes", appointment.getNotes() != null && !appointment.getNotes().isBlank() ? appointment.getNotes() : "None"}
                        },
                        "You will receive an instant email notification once the business confirms your booking."
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }

            // 1B. Business Owner Email
            String bizTarget = businessEmail != null ? businessEmail : ownerEmail;
            if (bizTarget != null && !bizTarget.isBlank()) {
                String bizSubject = "New Appointment Request: " + customerName + " - " + serviceName + " [" + appointmentId + "]";
                String bizHtml = buildEmailCard(
                        "New Booking Request Received",
                        "You have received a new appointment booking request from " + customerName + ". Please review and confirm the slot in your Skedula Owner Portal.",
                        "#3b82f6",
                        "Action Required",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Customer Name", customerName},
                                {"Customer Email", customerEmail != null ? customerEmail : "N/A"},
                                {"Service Requested", serviceName},
                                {"Requested Schedule", formattedDateTime},
                                {"Session Duration", (service != null && service.getDuration() != null ? service.getDuration() : 30) + " mins"},
                                {"Booking Value (Escrowed)", "₹" + price},
                                {"Customer Notes", appointment.getNotes() != null && !appointment.getNotes().isBlank() ? appointment.getNotes() : "None"}
                        },
                        "Log in to your Skedula dashboard to accept, reschedule, or manage this slot."
                );
                sendHtmlEmail(bizTarget, bizSubject, bizHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment booked alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // 2. APPOINTMENT APPROVED / CONFIRMED ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentApprovedAlerts(Appointment appointment) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            User ownerUser = business != null ? business.getOwner() : null;
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";
            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";
            String businessEmail = business != null && business.getEmail() != null ? business.getEmail() : (ownerUser != null ? ownerUser.getEmail() : null);

            String serviceName = service != null ? service.getName() : "Appointment Service";
            BigDecimal price = service != null && service.getPrice() != null ? service.getPrice() : BigDecimal.ZERO;
            String formattedDateTime = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Scheduled Date";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            // 2A. Customer Email
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Appointment Confirmed! 🎉 " + serviceName + " at " + businessName + " [" + appointmentId + "]";
                String custHtml = buildEmailCard(
                        "Appointment Confirmed & Scheduled",
                        "Great news, " + customerName + "! Your appointment with " + businessName + " has been approved and confirmed.",
                        "#10b981",
                        "Confirmed & Slot Secured",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"Confirmed Schedule", formattedDateTime},
                                {"Session Duration", (service != null && service.getDuration() != null ? service.getDuration() : 30) + " mins"},
                                {"Provider Business", businessName},
                                {"Business Phone", business != null && business.getPhone() != null ? business.getPhone() : "N/A"},
                                {"Location Address", business != null && business.getAddress() != null ? business.getAddress() + ", " + (business.getCity() != null ? business.getCity() : "") : "N/A"},
                                {"Escrow Protection", "Secured (₹" + price + ")"}
                        },
                        "Please arrive 5-10 minutes prior to your scheduled time. You can view full details or reschedule from your Skedula appointments portal."
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }

            // 2B. Business Email
            if (businessEmail != null && !businessEmail.isBlank()) {
                String bizSubject = "Slot Confirmed: " + serviceName + " for " + customerName + " [" + appointmentId + "]";
                String bizHtml = buildEmailCard(
                        "Slot Confirmed for Client",
                        "You have confirmed the appointment booking for " + customerName + ".",
                        "#10b981",
                        "Confirmed in Calendar",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Client Name", customerName},
                                {"Service", serviceName},
                                {"Confirmed Time", formattedDateTime},
                                {"Client Notes", appointment.getNotes() != null && !appointment.getNotes().isBlank() ? appointment.getNotes() : "None"}
                        },
                        "Remember to mark the appointment as completed once delivered to release your earnings from Escrow."
                );
                sendHtmlEmail(businessEmail, bizSubject, bizHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment approved alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // 3. APPOINTMENT REJECTED / DECLINED ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentRejectedAlerts(Appointment appointment) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";
            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";

            String serviceName = service != null ? service.getName() : "Appointment Service";
            BigDecimal price = service != null && service.getPrice() != null ? service.getPrice() : BigDecimal.ZERO;
            String formattedDateTime = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Requested Date";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            // Customer Email
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Appointment Update: Request Declined & Refund Issued [" + appointmentId + "]";
                String custHtml = buildEmailCard(
                        "Appointment Request Declined",
                        "Hello " + customerName + ", unfortunately " + businessName + " is unable to accommodate your requested slot on " + formattedDateTime + ".",
                        "#ef4444",
                        "Declined & 100% Refunded",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"Requested Schedule", formattedDateTime},
                                {"Refund Status", "₹" + price + " refunded to your Skedula Wallet"},
                                {"Provider Business", businessName}
                        },
                        "Your full payment of ₹" + price + " has been instantly returned to your Skedula Wallet balance. You may choose another available time or book with another provider."
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment rejected alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // 4. APPOINTMENT RESCHEDULED ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentRescheduledAlerts(Appointment appointment, LocalDateTime oldDateTime) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            User ownerUser = business != null ? business.getOwner() : null;
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";
            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";
            String businessEmail = business != null && business.getEmail() != null ? business.getEmail() : (ownerUser != null ? ownerUser.getEmail() : null);

            String serviceName = service != null ? service.getName() : "Appointment Service";
            String newFormatted = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Updated Date";
            String oldFormatted = oldDateTime != null ? oldDateTime.format(DATE_TIME_FORMATTER) : "Previous Time";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            // 4A. Customer Alert
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Appointment Rescheduled: " + serviceName + " [" + appointmentId + "]";
                String custHtml = buildEmailCard(
                        "Appointment Rescheduled",
                        "Hi " + customerName + ", your appointment schedule for " + serviceName + " at " + businessName + " has been successfully updated.",
                        "#8b5cf6",
                        "Rescheduled",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"New Schedule", newFormatted},
                                {"Previous Schedule", oldFormatted},
                                {"Provider Business", businessName},
                                {"Location Address", business != null && business.getAddress() != null ? business.getAddress() + ", " + (business.getCity() != null ? business.getCity() : "") : "N/A"}
                        },
                        "Your appointment details and escrow deposit remain secure with your updated reservation."
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }

            // 4B. Business Alert
            if (businessEmail != null && !businessEmail.isBlank()) {
                String bizSubject = "Appointment Rescheduled: " + customerName + " - " + serviceName + " [" + appointmentId + "]";
                String bizHtml = buildEmailCard(
                        "Schedule Update Alert",
                        "An appointment slot has been rescheduled for " + customerName + ".",
                        "#8b5cf6",
                        "Schedule Modified",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Client Name", customerName},
                                {"Service", serviceName},
                                {"New Time", newFormatted},
                                {"Old Time", oldFormatted}
                        },
                        "Please check your updated calendar in the Skedula Business Portal."
                );
                sendHtmlEmail(businessEmail, bizSubject, bizHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment rescheduled alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // 5. APPOINTMENT CANCELLED ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentCancelledAlerts(Appointment appointment, String cancelledBy, BigDecimal refundAmount, BigDecimal cancellationFee) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            User ownerUser = business != null ? business.getOwner() : null;
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";
            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";
            String businessEmail = business != null && business.getEmail() != null ? business.getEmail() : (ownerUser != null ? ownerUser.getEmail() : null);

            String serviceName = service != null ? service.getName() : "Appointment Service";
            String formattedDateTime = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Scheduled Date";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            BigDecimal refund = refundAmount != null ? refundAmount : BigDecimal.ZERO;
            BigDecimal fee = cancellationFee != null ? cancellationFee : BigDecimal.ZERO;

            // 5A. Customer Alert
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Appointment Cancelled: " + serviceName + " [" + appointmentId + "]";
                String custHtml = buildEmailCard(
                        "Appointment Cancelled",
                        "Hello " + customerName + ", your appointment with " + businessName + " for " + serviceName + " has been cancelled.",
                        "#64748b",
                        "Cancelled & Refunded",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"Cancelled Slot", formattedDateTime},
                                {"Cancelled By", cancelledBy != null ? cancelledBy : "User"},
                                {"Refund to Wallet", "₹" + refund},
                                {"Cancellation Fee", "₹" + fee}
                        },
                        "The refund amount of ₹" + refund + " has been credited directly to your Skedula wallet balance."
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }

            // 5B. Business Alert
            if (businessEmail != null && !businessEmail.isBlank()) {
                String bizSubject = "Appointment Cancelled: " + customerName + " [" + appointmentId + "]";
                String bizHtml = buildEmailCard(
                        "Appointment Cancellation Notice",
                        "The appointment for " + customerName + " (" + serviceName + ") on " + formattedDateTime + " has been cancelled by " + (cancelledBy != null ? cancelledBy : "the user") + ".",
                        "#64748b",
                        "Slot Released",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Client Name", customerName},
                                {"Service", serviceName},
                                {"Cancelled Time", formattedDateTime},
                                {"Late Fee Compensation", fee.compareTo(BigDecimal.ZERO) > 0 ? "₹" + fee + " credited to business wallet" : "None (Full client refund)"}
                        },
                        "This slot has now been reopened in your service availability schedule."
                );
                sendHtmlEmail(businessEmail, bizSubject, bizHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment cancelled alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // 6. APPOINTMENT COMPLETED / DONE ALERTS
    // ==========================================
    @Override
    @Async
    public void sendAppointmentCompletedAlerts(Appointment appointment, BigDecimal netReleasedAmount) {
        try {
            Customer customer = appointment.getBookedBy();
            User customerUser = customer != null ? customer.getUser() : null;
            Business business = appointment.getBusiness();
            User ownerUser = business != null ? business.getOwner() : null;
            BusinessServiceOffered service = appointment.getServiceOffered();

            String customerEmail = customerUser != null ? customerUser.getEmail() : null;
            String customerName = customerUser != null && customerUser.getName() != null ? customerUser.getName() : "Valued Customer";
            String businessName = business != null && business.getName() != null ? business.getName() : "Service Provider";
            String businessEmail = business != null && business.getEmail() != null ? business.getEmail() : (ownerUser != null ? ownerUser.getEmail() : null);

            String serviceName = service != null ? service.getName() : "Appointment Service";
            String formattedDateTime = appointment.getAppointmentDateTime() != null ? appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER) : "Service Date";
            String appointmentId = appointment.getAppointmentId() != null ? appointment.getAppointmentId() : String.valueOf(appointment.getId());

            BigDecimal netPayout = netReleasedAmount != null ? netReleasedAmount : (service != null && service.getPrice() != null ? service.getPrice().multiply(BigDecimal.valueOf(0.95)) : BigDecimal.ZERO);

            // 6A. Customer Email
            if (customerEmail != null && !customerEmail.isBlank()) {
                String custSubject = "Thank You for Visiting " + businessName + "! How was your experience? ⭐";
                String custHtml = buildEmailCard(
                        "Service Completed",
                        "Hi " + customerName + ", thank you for choosing " + businessName + "! Your session for " + serviceName + " has been marked as completed.",
                        "#10b981",
                        "Completed",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Service", serviceName},
                                {"Completed On", formattedDateTime},
                                {"Provider Business", businessName}
                        },
                        "We hope you had an exceptional experience. Please take a moment to leave a verified review on Skedula to help others discover quality services!"
                );
                sendHtmlEmail(customerEmail, custSubject, custHtml);
            }

            // 6B. Business Email
            if (businessEmail != null && !businessEmail.isBlank()) {
                String bizSubject = "Payout Released: Appointment " + appointmentId + " Completed! 💰";
                String bizHtml = buildEmailCard(
                        "Appointment Completed & Funds Released",
                        "Congratulations! Appointment " + appointmentId + " for " + customerName + " has been marked as completed.",
                        "#10b981",
                        "Escrow Settled",
                        new String[][]{
                                {"Appointment ID", appointmentId},
                                {"Client Name", customerName},
                                {"Service Delivered", serviceName},
                                {"Net Earnings Credited", "₹" + netPayout}
                        },
                        "Your net earnings of ₹" + netPayout + " have been automatically released from Escrow into your Skedula wallet balance."
                );
                sendHtmlEmail(businessEmail, bizSubject, bizHtml);
            }
        } catch (Exception e) {
            log.error("Error dispatching appointment completed alerts for appointment ID {}: {}", appointment.getId(), e.getMessage());
        }
    }

    // ==========================================
    // HTML EMAIL CARD BUILDER
    // ==========================================
    private String buildEmailCard(String title, String leadText, String badgeColor, String badgeLabel, String[][] details, String footerNote) {
        StringBuilder rows = new StringBuilder();
        for (String[] detail : details) {
            if (detail.length >= 2) {
                rows.append("<tr>")
                        .append("<td style=\"padding: 10px 14px; color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9; width: 40%;\">")
                        .append(detail[0])
                        .append("</td>")
                        .append("<td style=\"padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 700; border-bottom: 1px solid #f1f5f9; width: 60%;\">")
                        .append(detail[1])
                        .append("</td>")
                        .append("</tr>");
            }
        }

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                + "<title>" + title + "</title>"
                + "</head>"
                + "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;\">"
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; padding: 30px 15px;\">"
                + "<tr>"
                + "<td align=\"center\">"
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\">"

                // Header Banner
                + "<tr>"
                + "<td style=\"background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 30px; text-align: left;\">"
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
                + "<tr>"
                + "<td>"
                + "<span style=\"font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;\">SKEDULA</span>"
                + "<span style=\"display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;\">Appointment & Booking Network</span>"
                + "</td>"
                + "<td align=\"right\">"
                + "<span style=\"display: inline-block; background-color: " + badgeColor + "; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;\">"
                + badgeLabel
                + "</span>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</td>"
                + "</tr>"

                // Body Content
                + "<tr>"
                + "<td style=\"padding: 30px 30px 20px 30px;\">"
                + "<h2 style=\"margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;\">" + title + "</h2>"
                + "<p style=\"margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;\">" + leadText + "</p>"

                // Details Table Box
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate; overflow: hidden; margin-bottom: 24px;\">"
                + rows
                + "</table>"

                // Footer Note
                + (footerNote != null && !footerNote.isBlank() ? "<div style=\"background-color: #f1f5f9; padding: 14px 16px; border-radius: 10px; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;\">" + footerNote + "</div>" : "")
                + "</td>"
                + "</tr>"

                // Email Footer
                + "<tr>"
                + "<td style=\"background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;\">"
                + "<p style=\"margin: 0; font-size: 11px; color: #94a3b8;\">This is an automated notification from Skedula. All appointment transactions are protected by Escrow.</p>"
                + "<p style=\"margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;\">© " + LocalDateTime.now().getYear() + " Skedula Technologies Inc. All rights reserved.</p>"
                + "</td>"
                + "</tr>"

                + "</table>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</body>"
                + "</html>";
    }
}
