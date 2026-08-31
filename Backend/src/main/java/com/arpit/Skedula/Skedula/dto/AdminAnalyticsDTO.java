package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminAnalyticsDTO {
    private long totalBusinesses;
    private long activeBusinesses;
    private long lockedBusinesses;

    private long totalServices;
    private long activeServices;

    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingAppointments;

    private long totalUsers;
    private long totalOwners;
    private long totalCustomers;
    private long totalAdmins;

    private BigDecimal totalPlatformRevenue;
    private BigDecimal totalEscrowBalance;
}
