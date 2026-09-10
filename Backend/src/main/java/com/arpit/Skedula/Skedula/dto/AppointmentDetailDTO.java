package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AppointmentDetailDTO {
    private Long id;
    private String appointmentId;
    private LocalDateTime dateTime;
    private AppointmentStatus appointmentStatus;
    private String notes;
    private LocalDateTime rescheduledAt;

    // Service Details
    private Long serviceId;
    private String serviceOfferedId;
    private String serviceName;
    private String serviceDescription;
    private BigDecimal price;
    private Long durationInMinutes;
    private String serviceImageUrl;
    private String category;

    // Business Details
    private Long businessId;
    private String bid;
    private String businessName;
    private String businessDescription;
    private String businessAddress;
    private String businessCity;
    private String businessPhone;
    private String businessEmail;
    private String businessImageUrl;
    private String openTime;
    private String closeTime;

    // Customer / Client Details
    private Long customerId;
    private String customId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerImageUrl;

    // Financial & Escrow Summary
    private BigDecimal totalAmount;
    private BigDecimal platformFee;
    private BigDecimal netBusinessAmount;
    private String paymentMethod;
}
