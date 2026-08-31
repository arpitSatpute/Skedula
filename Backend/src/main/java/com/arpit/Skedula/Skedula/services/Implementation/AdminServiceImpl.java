package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.AdminAnalyticsDTO;
import com.arpit.Skedula.Skedula.dto.AdminServiceDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import com.arpit.Skedula.Skedula.entity.enums.PaymentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.*;
import com.arpit.Skedula.Skedula.services.AdminService;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final BusinessRepository businessRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final BusinessServiceOfferedService businessServiceOfferedService;
    private final AppointmentService appointmentService;

    @Override
    public AdminAnalyticsDTO getPlatformAnalytics() {
        List<Business> allBusinesses = businessRepository.findAll();
        long activeBiz = allBusinesses.stream().filter(b -> b.getStatus() == BusinessStatus.AVAILABLE).count();
        long lockedBiz = allBusinesses.stream().filter(b -> b.getStatus() == BusinessStatus.UNAVAILABLE).count();

        List<BusinessServiceOffered> allServices = businessServiceOfferedRepository.findAll();
        long activeSrv = allServices.stream().filter(s -> s.getStatus() == ServiceStatus.AVAILABLE).count();

        List<Appointment> allAppts = appointmentRepository.findAll();
        long completedAppts = allAppts.stream().filter(a -> a.getAppointmentStatus() == AppointmentStatus.DONE).count();
        long cancelledAppts = allAppts.stream().filter(a -> a.getAppointmentStatus() == AppointmentStatus.CANCELLED).count();
        long pendingAppts = allAppts.stream().filter(a -> a.getAppointmentStatus() == AppointmentStatus.PENDING).count();

        List<User> allUsers = userRepository.findAll();
        long owners = allUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(Role.OWNER)).count();
        long customers = allUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(Role.CUSTOMER)).count();
        long admins = allUsers.stream().filter(u -> u.getRoles() != null && u.getRoles().contains(Role.ADMIN)).count();

        // Calculate Escrow Balance across all wallets
        List<Wallet> allWallets = walletRepository.findAll();
        BigDecimal totalEscrow = allWallets.stream()
                .map(w -> w.getBalance() != null ? w.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Platform fee 5% of completed appointments or payments
        List<Payment> allPayments = paymentRepository.findAll();
        BigDecimal totalPlatformRevenue = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.COMPLETED)
                .map(p -> p.getAmount() != null ? p.getAmount().multiply(BigDecimal.valueOf(0.05)) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return AdminAnalyticsDTO.builder()
                .totalBusinesses(allBusinesses.size())
                .activeBusinesses(activeBiz)
                .lockedBusinesses(lockedBiz)
                .totalServices(allServices.size())
                .activeServices(activeSrv)
                .totalAppointments(allAppts.size())
                .completedAppointments(completedAppts)
                .cancelledAppointments(cancelledAppts)
                .pendingAppointments(pendingAppts)
                .totalUsers(allUsers.size())
                .totalOwners(owners)
                .totalCustomers(customers)
                .totalAdmins(admins)
                .totalPlatformRevenue(totalPlatformRevenue)
                .totalEscrowBalance(totalEscrow)
                .build();
    }

    @Override
    public List<BusinessCard> getAllBusinesses(String status, String search) {
        List<Business> list = businessRepository.findAll();

        return list.stream()
                .filter(b -> {
                    if (status != null && !status.equalsIgnoreCase("ALL")) {
                        if (status.equalsIgnoreCase("AVAILABLE") && b.getStatus() != BusinessStatus.AVAILABLE) return false;
                        if (status.equalsIgnoreCase("UNAVAILABLE") && b.getStatus() != BusinessStatus.UNAVAILABLE) return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase();
                        boolean matchName = b.getName() != null && b.getName().toLowerCase().contains(s);
                        boolean matchCity = b.getCity() != null && b.getCity().toLowerCase().contains(s);
                        boolean matchId = b.getBusinessId() != null && b.getBusinessId().toLowerCase().contains(s);
                        return matchName || matchCity || matchId;
                    }
                    return true;
                })
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Void changeBusinessAvailability(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        appointmentService.cancelAllAppointmentsByBusinessId(businessId);
        businessServiceOfferedService.unavailableAllServicesByBusinessId(businessId);
        business.setStatus(BusinessStatus.UNAVAILABLE);
        businessRepository.save(business);
        return null;
    }

    @Override
    @Transactional
    public Business makeBusinessAvailable(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        business.setStatus(BusinessStatus.AVAILABLE);
        return businessRepository.save(business);
    }

    @Override
    @Transactional
    public Void deleteBusiness(Long businessId) {
        changeBusinessAvailability(businessId);
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        businessRepository.delete(business);
        return null;
    }

    @Override
    public List<AdminServiceDTO> getAllServices(String status) {
        List<BusinessServiceOffered> list = businessServiceOfferedRepository.findAll();

        return list.stream()
                .filter(s -> {
                    if (status != null && !status.equalsIgnoreCase("ALL")) {
                        if (status.equalsIgnoreCase("AVAILABLE") && s.getStatus() != ServiceStatus.AVAILABLE) return false;
                        if (status.equalsIgnoreCase("UNAVAILABLE") && s.getStatus() != ServiceStatus.UNAVAILABLE) return false;
                    }
                    return true;
                })
                .map(s -> AdminServiceDTO.builder()
                        .id(s.getId())
                        .serviceOfferedId(s.getServiceOfferedId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .duration(s.getDuration())
                        .price(s.getPrice())
                        .imageUrl(s.getImageUrl())
                        .totalSlots(s.getTotalSlots())
                        .status(s.getStatus())
                        .businessId(s.getBusiness() != null ? s.getBusiness().getId() : null)
                        .businessName(s.getBusiness() != null ? s.getBusiness().getName() : "Unknown Business")
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Void changeServiceAvailability(Long serviceId) {
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        appointmentService.cancelAllAppointmentsByServiceOfferedId(serviceId);
        serviceOffered.setStatus(ServiceStatus.UNAVAILABLE);
        businessServiceOfferedRepository.save(serviceOffered);
        return null;
    }

    @Override
    @Transactional
    public BusinessServiceOffered makeServiceAvailable(Long serviceId) {
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        serviceOffered.setStatus(ServiceStatus.AVAILABLE);
        return businessServiceOfferedRepository.save(serviceOffered);
    }

    @Override
    @Transactional
    public Void deleteService(Long serviceId) {
        changeServiceAvailability(serviceId);
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        businessServiceOfferedRepository.delete(serviceOffered);
        return null;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserDTO dto = new UserDTO();
            dto.setId(u.getId());
            dto.setName(u.getName());
            dto.setEmail(u.getEmail());
            dto.setImageUrl(u.getImageUrl());
            dto.setRoles(u.getRoles());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDTO updateUserRole(Long userId, Role role, boolean addRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<Role> roles = new HashSet<>(user.getRoles());
        if (addRole) {
            roles.add(role);
        } else {
            roles.remove(role);
        }
        user.setRoles(roles);
        User saved = userRepository.save(user);

        UserDTO dto = new UserDTO();
        dto.setId(saved.getId());
        dto.setName(saved.getName());
        dto.setEmail(saved.getEmail());
        dto.setImageUrl(saved.getImageUrl());
        dto.setRoles(saved.getRoles());
        return dto;
    }

    private BusinessCard convertToCard(Business business) {
        BusinessCard card = new BusinessCard();
        card.setId(business.getId());
        card.setStatus(business.getStatus());
        card.setBusinessId(business.getBusinessId());
        card.setName(business.getName()); card.setCategory(business.getCategory() != null ? business.getCategory() : "Spa & Wellness");
        card.setDescription(business.getDescription());
        card.setAddress(business.getAddress());
        card.setCity(business.getCity());
        card.setState(business.getState());
        card.setCountry(business.getCountry());
        card.setPhone(business.getPhone());
        card.setEmail(business.getEmail());
        card.setZipCode(business.getZipCode());
        card.setMapLink(business.getMapLink());
        card.setOpenTime(business.getOpenTime());
        card.setCloseTime(business.getCloseTime());
        card.setLatitude(business.getLatitude());
        card.setLongitude(business.getLongitude());
        card.setCancellationCutoffMinutes(business.getCancellationCutoffMinutes() != null ? business.getCancellationCutoffMinutes() : 120);
        card.setCancellationFeePercentage(business.getCancellationFeePercentage() != null ? business.getCancellationFeePercentage() : 20.0);

        if (reviewRepository != null) {
            try {
                Double avg = reviewRepository.getAverageRatingByBusinessId(business.getId());
                Long total = reviewRepository.countByBusiness_Id(business.getId());
                card.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
                card.setTotalReviews(total != null ? total : 0L);
            } catch (Exception ignored) {
                card.setAverageRating(5.0);
                card.setTotalReviews(0L);
            }
        }
        return card;
    }
}
