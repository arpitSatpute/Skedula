package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;


@Service
public interface BusinessService{


    Page<BusinessDTO> getAllBusiness(Integer pageOffset, Integer pageSize);

    BusinessDTO getBusinessById(Long id);

    BusinessDTO register(BusinessDTO businessDTO);

    BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO);

    Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword);

    boolean isOwnerOfProfile(Long id);

    boolean isOwnerOfAppointment(Long appointmentId);

    boolean isOwnerOfService(Long serviceId);

    void removeBusinessById(Long id);
}
