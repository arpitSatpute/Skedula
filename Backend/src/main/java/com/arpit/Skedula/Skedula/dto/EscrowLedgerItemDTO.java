package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EscrowLedgerItemDTO {

    private Long id;
    private String escrowTransactionId;

    // WHO added funds (Customer)
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String customerEmail;

    // FOR WHOM (Business & Owner)
    private Long businessId;
    private String businessName;
    private Long businessOwnerId;
    private String businessOwnerName;
    private String businessOwnerEmail;

    // FOR WHAT (Service & Appointment)
    private Long serviceId;
    private String serviceName;
    private Long appointmentId;
    private String appointmentCode;
    private LocalDateTime appointmentDateTime;

    // Financial breakdown
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal businessShare;

    // Lifecycle Status
    private String status; // HELD_IN_ESCROW, RELEASED_TO_BUSINESS, REFUNDED_TO_CUSTOMER
    private LocalDateTime createdAt;
    private LocalDateTime releasedAt;
    private String notes;
}
