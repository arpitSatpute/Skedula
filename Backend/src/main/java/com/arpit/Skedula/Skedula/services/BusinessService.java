package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;


@Service
public interface BusinessService{


    Page<BusinessCard> getAllBusiness(Integer pageOffset, Integer pageSize);

    BusinessCard getBusinessById(Long id);

    BusinessDTO register(BusinessDTO businessDTO);

    BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO);

    Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword);

    boolean isOwnerOfProfile(Long id);

    boolean isOwnerOfAppointment(Long appointmentId);

    boolean isOwnerOfService(Long serviceId);

    boolean isCurrentUser(Long userId);

    void removeBusinessById(Long id);

    BusinessDTO getBusinessByUser();
}
