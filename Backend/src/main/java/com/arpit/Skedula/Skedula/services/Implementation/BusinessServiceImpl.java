package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.repository.ReviewRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.BusinessService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service("businessService")
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final ModelMapper modelMapper;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final AppointmentService appointmentService;
    private final BusinessServiceOfferedService businessServiceOfferedService;
    private final ReviewRepository reviewRepository;

    @Override
    public Page<BusinessCard> getAllBusiness(Integer pageOffset, Integer pageSize) {
        Page<Business> businessPage = businessRepository.findAllByStatus(PageRequest.of(pageOffset, pageSize), BusinessStatus.AVAILABLE);
        List<BusinessCard> card = businessPage.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
        return new PageImpl<>(card, businessPage.getPageable(), businessPage.getTotalElements());
    }

    @Override
    public BusinessCard getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        if(business.getStatus() == BusinessStatus.UNAVAILABLE) {
            throw new RuntimeException("Business status is not AVAILABLE");
        }
        return convertToCard(business);
    }

    @Override
    public BusinessCard getBusinessBySlug(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            throw new ResourceNotFoundException("Invalid business slug");
        }

        Business business = null;

        // 1. Try numeric ID
        try {
            Long id = Long.parseLong(slug.trim());
            business = businessRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {
        }

        // 2. Try by custom businessId (e.g. SBE1234567)
        if (business == null) {
            business = businessRepository.findByBusinessId(slug.trim()).orElse(null);
        }

        // 3. Try by Name (replacing dashes with spaces)
        if (business == null) {
            String nameWithSpaces = slug.trim().replace("-", " ");
            business = businessRepository.findByNameIgnoreCase(nameWithSpaces).orElse(null);
        }

        // 4. Try exact name
        if (business == null) {
            business = businessRepository.findByNameIgnoreCase(slug.trim()).orElse(null);
        }

        if (business == null || business.getStatus() == BusinessStatus.UNAVAILABLE) {
            throw new ResourceNotFoundException("Business not found or unavailable with slug: " + slug);
        }

        return convertToCard(business);
    }

    @Override
    public List<BusinessCard> getNearbyBusinesses(Double lat, Double lng, Double radiusKm, String city, String state, String category) {
        List<Business> allBusinesses = businessRepository.findByStatus(BusinessStatus.AVAILABLE);
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;

        return allBusinesses.stream()
                .filter(b -> {
                    if (city != null && !city.trim().isEmpty() && !city.equalsIgnoreCase("all")) {
                        if (b.getCity() == null || !b.getCity().trim().equalsIgnoreCase(city.trim())) {
                            return false;
                        }
                    }
                    if (state != null && !state.trim().isEmpty() && !state.equalsIgnoreCase("all")) {
                        if (b.getState() == null || !b.getState().trim().equalsIgnoreCase(state.trim())) {
                            return false;
                        }
                    }
                    if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
                        if (b.getCategory() == null || !b.getCategory().trim().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(b -> {
                    BusinessCard card = convertToCard(b);
                    if (lat != null && lng != null && b.getLatitude() != null && b.getLongitude() != null) {
                        double dist = haversineDistance(lat, lng, b.getLatitude(), b.getLongitude());
                        card.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return card;
                })
                .filter(card -> {
                    if (lat != null && lng != null) {
                        return card.getDistanceKm() != null && card.getDistanceKm() <= maxRadius;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if (a.getDistanceKm() != null && b.getDistanceKm() != null) {
                        return Double.compare(a.getDistanceKm(), b.getDistanceKm());
                    }
                    return 0;
                })
                .collect(Collectors.toList());
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Override
    @Transactional
    public BusinessDTO register(BusinessDTO businessDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        if(!(user.getRoles().contains(Role.OWNER))){
            throw new RuntimeException("User is not owner of this business");
        }
        Boolean isExist = businessRepository.existsByName(businessDTO.getName());
        if(isExist){
            throw new RuntimeException("Business with name: " + businessDTO.getName() + " already exists");
        }

        Business business = modelMapper.map(businessDTO, Business.class);
        business.setOwner(user);
        business.setBusinessId(generateBusinessId());
        business.setStatus(BusinessStatus.AVAILABLE);

        if (businessDTO.getCategory() != null && !businessDTO.getCategory().trim().isEmpty()) {
            business.setCategory(businessDTO.getCategory().trim());
        } else {
            business.setCategory("Spa & Wellness");
        }

        if (businessDTO.getLatitude() != null) business.setLatitude(businessDTO.getLatitude());
        if (businessDTO.getLongitude() != null) business.setLongitude(businessDTO.getLongitude());
        if (businessDTO.getCancellationCutoffMinutes() != null) business.setCancellationCutoffMinutes(businessDTO.getCancellationCutoffMinutes());
        if (businessDTO.getCancellationFeePercentage() != null) business.setCancellationFeePercentage(businessDTO.getCancellationFeePercentage());

        Business saved = businessRepository.save(business);
        return convertToDTO(saved);
    }

    @Override
    public BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));

        if(businessDTO.getName() != null) business.setName(businessDTO.getName());
        if(businessDTO.getCategory() != null) business.setCategory(businessDTO.getCategory());
        if(businessDTO.getDescription() != null) business.setDescription(businessDTO.getDescription());
        if(businessDTO.getAddress() != null) business.setAddress(businessDTO.getAddress());
        if(businessDTO.getCity() != null) business.setCity(businessDTO.getCity());
        if(businessDTO.getState() != null) business.setState(businessDTO.getState());
        if(businessDTO.getCountry() != null) business.setCountry(businessDTO.getCountry());
        if(businessDTO.getPhone() != null) business.setPhone(businessDTO.getPhone());
        if(businessDTO.getEmail() != null) business.setEmail(businessDTO.getEmail());
        if(businessDTO.getZipCode() != null) business.setZipCode(businessDTO.getZipCode());
        if(businessDTO.getMapLink() != null) business.setMapLink(businessDTO.getMapLink());
        if(businessDTO.getOpenTime() != null) business.setOpenTime(businessDTO.getOpenTime());
        if(businessDTO.getCloseTime() != null) business.setCloseTime(businessDTO.getCloseTime());
        if(businessDTO.getLatitude() != null) business.setLatitude(businessDTO.getLatitude());
        if(businessDTO.getLongitude() != null) business.setLongitude(businessDTO.getLongitude());
        if(businessDTO.getCancellationCutoffMinutes() != null) business.setCancellationCutoffMinutes(businessDTO.getCancellationCutoffMinutes());
        if(businessDTO.getCancellationFeePercentage() != null) business.setCancellationFeePercentage(businessDTO.getCancellationFeePercentage());

        Business saved = businessRepository.save(business);
        return convertToDTO(saved);
    }

    @Override
    public Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageOffset, pageSize);
        Page<Business> businessPage = businessRepository.findByKeyword(keyword, pageable);
        List<BusinessDTO> dtos = businessPage.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, businessPage.getPageable(), businessPage.getTotalElements());
    }

    @Override
    public boolean isOwnerOfProfile(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Business business = businessRepository.findById(id).orElse(null);
        return business != null && business.getOwner() != null && business.getOwner().getId() == user.getId();
    }

    @Override
    public boolean isOwnerOfAppointment(Long appointmentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));
        return appointment.getBusiness() != null && appointment.getBusiness().getOwner() != null && appointment.getBusiness().getOwner().getId() == user.getId();
    }

    @Override
    public boolean isOwnerOfService(Long serviceId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        BusinessServiceOffered service = businessServiceOfferedRepository.findById(serviceId).orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));
        return service.getBusiness() != null && service.getBusiness().getOwner() != null && service.getBusiness().getOwner().getId() == user.getId();
    }

    @Override
    public boolean isCurrentUser(Long userId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return userId != null && user.getId() == userId;
    }

    @Override
    public void removeBusinessById(Long id) {
        Business business = businessRepository.findById(id).orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        business.setStatus(BusinessStatus.UNAVAILABLE);
        businessRepository.save(business);
    }

    @Override
    public BusinessDTO getBusinessByUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Business business = businessRepository.findByOwner_Id(user.getId()).orElse(null);
        if(business == null) {
            return null;
        }
        return convertToDTO(business);
    }

    private BusinessDTO convertToDTO(Business business) {
        BusinessDTO dto = new BusinessDTO();
        dto.setId(business.getId());
        dto.setBusinessId(business.getBusinessId());
        dto.setOwner(business.getOwner() != null ? business.getOwner().getId() : null);
        dto.setName(business.getName());
        dto.setCategory(business.getCategory() != null ? business.getCategory() : "Spa & Wellness");
        dto.setDescription(business.getDescription());
        dto.setEmail(business.getEmail());
        dto.setPhone(business.getPhone());
        dto.setAddress(business.getAddress());
        dto.setCity(business.getCity());
        dto.setState(business.getState());
        dto.setCountry(business.getCountry());
        dto.setZipCode(business.getZipCode());
        dto.setMapLink(business.getMapLink());
        dto.setLatitude(business.getLatitude());
        dto.setLongitude(business.getLongitude());
        dto.setCancellationCutoffMinutes(business.getCancellationCutoffMinutes());
        dto.setCancellationFeePercentage(business.getCancellationFeePercentage());
        dto.setIdentity(business.getIdentity());
        dto.setCRNNumber(business.getCRNNumber());
        dto.setGSTNumber(business.getGSTNumber());
        dto.setOpenTime(business.getOpenTime());
        dto.setCloseTime(business.getCloseTime());
        dto.setStatus(business.getStatus());
        return dto;
    }

    private BusinessCard convertToCard(Business business) {
        BusinessCard businessCard = new BusinessCard();
        businessCard.setId(business.getId());
        businessCard.setStatus(business.getStatus());
        businessCard.setBusinessId(business.getBusinessId());
        businessCard.setName(business.getName());
        businessCard.setCategory(business.getCategory() != null ? business.getCategory() : "Spa & Wellness");
        businessCard.setDescription(business.getDescription());
        businessCard.setAddress(business.getAddress());
        businessCard.setCity(business.getCity());
        businessCard.setState(business.getState());
        businessCard.setCountry(business.getCountry());
        businessCard.setPhone(business.getPhone());
        businessCard.setEmail(business.getEmail());
        businessCard.setZipCode(business.getZipCode());
        businessCard.setMapLink(business.getMapLink());
        businessCard.setOpenTime(business.getOpenTime());
        businessCard.setCloseTime(business.getCloseTime());
        businessCard.setLatitude(business.getLatitude());
        businessCard.setLongitude(business.getLongitude());
        businessCard.setCancellationCutoffMinutes(business.getCancellationCutoffMinutes() != null ? business.getCancellationCutoffMinutes() : 120);
        businessCard.setCancellationFeePercentage(business.getCancellationFeePercentage() != null ? business.getCancellationFeePercentage() : 20.0);

        if (reviewRepository != null) {
            try {
                Double avg = reviewRepository.getAverageRatingByBusinessId(business.getId());
                Long total = reviewRepository.countByBusiness_Id(business.getId());
                businessCard.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
                businessCard.setTotalReviews(total != null ? total : 0L);
            } catch (Exception ignored) {
                businessCard.setAverageRating(0.0);
                businessCard.setTotalReviews(0L);
            }
        }

        return businessCard;
    }

    private String generateBusinessId() {
        String prefix = "SBE";
        String uniqueId = String.valueOf(System.currentTimeMillis());
        return prefix + uniqueId;
    }
}
