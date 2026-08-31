package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.AdminAnalyticsDTO;
import com.arpit.Skedula.Skedula.dto.AdminServiceDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminService {

    AdminAnalyticsDTO getPlatformAnalytics();

    List<BusinessCard> getAllBusinesses(String status, String search);

    Void changeBusinessAvailability(Long businessId);

    Business makeBusinessAvailable(Long businessId);

    Void deleteBusiness(Long businessId);

    List<AdminServiceDTO> getAllServices(String status);

    Void changeServiceAvailability(Long serviceId);

    BusinessServiceOffered makeServiceAvailable(Long serviceId);

    Void deleteService(Long serviceId);

    List<UserDTO> getAllUsers();

    UserDTO updateUserRole(Long userId, Role role, boolean addRole);

    com.arpit.Skedula.Skedula.dto.AdminEscrowResponseDTO getAdminEscrowSummary();
}
