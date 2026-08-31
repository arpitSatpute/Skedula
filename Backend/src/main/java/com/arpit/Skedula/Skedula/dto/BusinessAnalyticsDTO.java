package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive analytics payload for a single business owner's dashboard.
 * All metrics are computed server-side from existing appointment, review,
 * wallet-transaction, and service data.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusinessAnalyticsDTO {

    // ── Appointment Funnel ──────────────────────────────────────────
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long rejectedAppointments;
    private long pendingAppointments;
    private long bookedAppointments;
    private long rescheduledAppointments;

    // ── Revenue ─────────────────────────────────────────────────────
    private BigDecimal totalRevenue;
    private BigDecimal thisMonthRevenue;
    private BigDecimal lastMonthRevenue;
    /** "YYYY-MM" → revenue for that month (last 6 months) */
    private Map<String, BigDecimal> monthlyRevenue;
    /** serviceName → total revenue earned from that service */
    private Map<String, BigDecimal> revenueByService;

    // ── Service Leaderboard ─────────────────────────────────────────
    /** Ordered list of services with performance stats */
    private List<ServiceStatDTO> serviceStats;

    // ── Peak Hours ──────────────────────────────────────────────────
    /** dayOfWeek (e.g. "MONDAY") → hour (0-23) → booking count */
    private Map<String, Map<Integer, Long>> peakHours;

    // ── Rating & Reviews ────────────────────────────────────────────
    private Double averageRating;
    private long totalReviews;
    /** rating value (1-5) → count */
    private Map<Integer, Long> ratingDistribution;
    /** "YYYY-MM" → avg rating that month */
    private Map<String, Double> monthlyRating;
    /** Most recent 5 reviews */
    private List<RecentReviewDTO> recentReviews;

    // ── Customer Loyalty ────────────────────────────────────────────
    private long uniqueCustomers;
    private long returningCustomers;
    private long newCustomers;

    // ── Nested DTOs ─────────────────────────────────────────────────

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ServiceStatDTO {
        private Long id;
        private String name;
        private BigDecimal price;
        private Long totalSlots;
        private long bookingCount;
        private BigDecimal revenue;
        private Double avgRating;
        private long cancellations;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentReviewDTO {
        private Integer rating;
        private String comment;
        private String createdAt;
        private String serviceName;
    }
}
