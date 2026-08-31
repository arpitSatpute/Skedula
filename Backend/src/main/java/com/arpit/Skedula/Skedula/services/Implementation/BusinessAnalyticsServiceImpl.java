package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.BusinessAnalyticsDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Computes all business-owner analytics in a single call.
 * All heavy lifting is done in Java streams over the appointment, review,
 * and wallet-transaction data — no extra schema changes required.
 */
@Service("businessAnalyticsService")
@RequiredArgsConstructor
public class BusinessAnalyticsServiceImpl {

    private final BusinessRepository businessRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final WalletRepository walletRepository;

    public BusinessAnalyticsDTO getAnalytics(Long businessId) {

        // ── Ownership check ─────────────────────────────────────────────
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found: " + businessId));
        boolean isOwner = business.getOwner() != null && business.getOwner().getEmail().equals(currentUser.getEmail());
        boolean isAdmin = currentUser.getRoles() != null && currentUser.getRoles().contains(com.arpit.Skedula.Skedula.entity.enums.Role.ADMIN);
        if (!isOwner && !isAdmin) {
            throw new SecurityException("Access denied: You do not own this business.");
        }

        // ── Load all raw data ────────────────────────────────────────────
        List<Appointment> allAppointments = appointmentRepository.findByBusiness_Id(businessId);
        List<Review> allReviews = reviewRepository.findByBusiness_IdOrderByCreatedAtDesc(businessId);

        // ── Appointment Funnel ───────────────────────────────────────────
        long total = allAppointments.size();
        long done      = countByStatus(allAppointments, AppointmentStatus.DONE);
        long cancelled = countByStatus(allAppointments, AppointmentStatus.CANCELLED);
        long rejected  = countByStatus(allAppointments, AppointmentStatus.REJECTED);
        long pending   = countByStatus(allAppointments, AppointmentStatus.PENDING);
        long booked    = countByStatus(allAppointments, AppointmentStatus.BOOKED);
        long rescheduled = allAppointments.stream().filter(a -> a.getRescheduledAt() != null).count();

        // ── Revenue (from owner's wallet CREDIT transactions linked to appointments) ──
        Optional<Wallet> walletOpt = walletRepository.findByUser(business.getOwner());
        List<WalletTransaction> credits = walletOpt
                .map(w -> w.getTransactions() == null ? List.<WalletTransaction>of() : w.getTransactions())
                .orElse(List.of())
                .stream()
                .filter(t -> t.getTransactionType() == TransactionType.CREDIT)
                .collect(Collectors.toList());

        // Fall back: derive revenue from DONE appointments × service price
        BigDecimal totalRevenue = credits.isEmpty()
                ? allAppointments.stream()
                    .filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE)
                    .map(a -> a.getServiceOffered() != null ? a.getServiceOffered().getPrice() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                : credits.stream().map(WalletTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Monthly revenue (last 6 months) from DONE appointments
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        allAppointments.stream()
                .filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE
                        && a.getAppointmentDateTime() != null
                        && a.getAppointmentDateTime().isAfter(sixMonthsAgo))
                .forEach(a -> {
                    String key = a.getAppointmentDateTime().format(monthFmt);
                    BigDecimal price = a.getServiceOffered() != null ? a.getServiceOffered().getPrice() : BigDecimal.ZERO;
                    monthlyRevenue.merge(key, price, BigDecimal::add);
                });

        // This month vs last month
        String thisMonthKey = LocalDateTime.now().format(monthFmt);
        String lastMonthKey = LocalDateTime.now().minusMonths(1).format(monthFmt);
        BigDecimal thisMonthRevenue = monthlyRevenue.getOrDefault(thisMonthKey, BigDecimal.ZERO);
        BigDecimal lastMonthRevenue = monthlyRevenue.getOrDefault(lastMonthKey, BigDecimal.ZERO);

        // Revenue by service
        Map<String, BigDecimal> revenueByService = allAppointments.stream()
                .filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE && a.getServiceOffered() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getServiceOffered().getName(),
                        Collectors.reducing(BigDecimal.ZERO,
                                a -> a.getServiceOffered().getPrice(), BigDecimal::add)));

        // ── Service Leaderboard ──────────────────────────────────────────
        // Group appointments by service
        Map<Long, List<Appointment>> byService = allAppointments.stream()
                .filter(a -> a.getServiceOffered() != null)
                .collect(Collectors.groupingBy(a -> a.getServiceOffered().getId()));

        // Average rating per service from reviews
        Map<Long, Double> avgRatingByService = allReviews.stream()
                .filter(r -> r.getService() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getService().getId(),
                        Collectors.averagingInt(Review::getRating)));

        // Build service stats (only services that have at least 1 appointment or exist on business)
        Set<BusinessServiceOffered> services = new LinkedHashSet<>();
        allAppointments.stream()
                .filter(a -> a.getServiceOffered() != null)
                .forEach(a -> services.add(a.getServiceOffered()));

        List<BusinessAnalyticsDTO.ServiceStatDTO> serviceStats = new ArrayList<>();
        for (BusinessServiceOffered svc : services) {
            List<Appointment> svcAppts = byService.getOrDefault(svc.getId(), List.of());
            long bookings    = svcAppts.stream().filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE).count();
            long cancels     = svcAppts.stream().filter(a -> a.getAppointmentStatus() == AppointmentStatus.CANCELLED).count();
            Long slots = svc.getTotalSlots() != null ? svc.getTotalSlots() : 0L;
            BigDecimal unitPrice = svc.getPrice() != null ? svc.getPrice() : BigDecimal.ZERO;
            BigDecimal rev = unitPrice.multiply(BigDecimal.valueOf(bookings));
            Double avgRating = avgRatingByService.get(svc.getId());
            serviceStats.add(BusinessAnalyticsDTO.ServiceStatDTO.builder()
                    .id(svc.getId())
                    .name(svc.getName())
                    .price(unitPrice)
                    .totalSlots(slots)
                    .bookingCount(bookings)
                    .revenue(rev)
                    .avgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                    .cancellations(cancels)
                    .build());
        }
        serviceStats.sort((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()));


        // ── Peak Hours Heatmap ───────────────────────────────────────────
        // dayOfWeek → hour → count  (only DONE + BOOKED appointments)
        Map<String, Map<Integer, Long>> peakHours = new LinkedHashMap<>();
        allAppointments.stream()
                .filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE
                        || a.getAppointmentStatus() == AppointmentStatus.BOOKED)
                .filter(a -> a.getAppointmentDateTime() != null)
                .forEach(a -> {
                    String day = a.getAppointmentDateTime().getDayOfWeek().name();
                    int hour   = a.getAppointmentDateTime().getHour();
                    peakHours.computeIfAbsent(day, k -> new TreeMap<>())
                             .merge(hour, 1L, Long::sum);
                });

        // ── Rating & Reviews ─────────────────────────────────────────────
        Double avgRating = reviewRepository.getAverageRatingByBusinessId(businessId);
        long totalReviews = reviewRepository.countByBusiness_Id(businessId);

        // Rating distribution
        Map<Integer, Long> ratingDistribution = new LinkedHashMap<>();
        for (int i = 1; i <= 5; i++) ratingDistribution.put(i, 0L);
        reviewRepository.getRatingDistributionByBusinessId(businessId)
                .forEach(row -> ratingDistribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue()));

        // Monthly rating trend
        Map<String, Double> monthlyRating = new LinkedHashMap<>();
        reviewRepository.getMonthlyRatingByBusinessId(businessId)
                .forEach(row -> {
                    String key = (String) row[0];
                    double val = ((Number) row[1]).doubleValue();
                    monthlyRating.put(key, Math.round(val * 10.0) / 10.0);
                });

        // Recent reviews (up to 5)
        List<BusinessAnalyticsDTO.RecentReviewDTO> recentReviews = allReviews.stream()
                .limit(5)
                .map(r -> BusinessAnalyticsDTO.RecentReviewDTO.builder()
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().format(monthFmt) : null)
                        .serviceName(r.getService() != null ? r.getService().getName() : null)
                        .build())
                .collect(Collectors.toList());

        // ── Customer Loyalty ─────────────────────────────────────────────
        Map<Long, Long> bookingsByCustomer = allAppointments.stream()
                .filter(a -> a.getBookedBy() != null)
                .collect(Collectors.groupingBy(a -> a.getBookedBy().getId(), Collectors.counting()));
        long uniqueCustomers    = bookingsByCustomer.size();
        long returningCustomers = bookingsByCustomer.values().stream().filter(c -> c > 1).count();
        long newCustomers       = uniqueCustomers - returningCustomers;

        // ── Assemble & return ────────────────────────────────────────────
        return BusinessAnalyticsDTO.builder()
                .totalAppointments(total)
                .completedAppointments(done)
                .cancelledAppointments(cancelled)
                .rejectedAppointments(rejected)
                .pendingAppointments(pending)
                .bookedAppointments(booked)
                .rescheduledAppointments(rescheduled)
                .totalRevenue(totalRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .monthlyRevenue(monthlyRevenue)
                .revenueByService(revenueByService)
                .serviceStats(serviceStats)
                .peakHours(peakHours)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .monthlyRating(monthlyRating)
                .recentReviews(recentReviews)
                .uniqueCustomers(uniqueCustomers)
                .returningCustomers(returningCustomers)
                .newCustomers(newCustomers)
                .build();
    }

    private long countByStatus(List<Appointment> list, AppointmentStatus status) {
        return list.stream().filter(a -> a.getAppointmentStatus() == status).count();
    }
}
