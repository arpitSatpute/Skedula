package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.services.AdminService;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.BusinessService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final BusinessService businessService;
    private final BusinessRepository businessRepository;
    private final BusinessServiceOfferedService businessServiceOfferedService;
    private final AppointmentService appointmentService;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;

    @Override
    public Void changeBusinessAvailability(Long businessId) {
        Business business = businessRepository.findById(businessId).orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        appointmentService.cancelAllAppointmentsByBusinessId(businessId);
        businessServiceOfferedService.unavailableAllServicesByBusinessId(businessId);
        business.setStatus(BusinessStatus.UNAVAILABLE);
        businessRepository.save(business);
        return null;
    }

    @Override
    public Void changeServiceAvailability(Long serviceId) {
        BusinessServiceOffered serviceOffered  = businessServiceOfferedRepository.findById(serviceId).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        appointmentService.cancelAllAppointmentsByServiceOfferedId(serviceId);
        serviceOffered.setStatus(ServiceStatus.UNAVAILABLE);
        businessServiceOfferedRepository.save(serviceOffered);
        return null;
    }

    public BusinessServiceOffered makeServiceAvailable(Long serviceId) {
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        serviceOffered.setStatus(ServiceStatus.AVAILABLE);
        return businessServiceOfferedRepository.save(serviceOffered);
    }

    public Business makeBusinessAvailable(Long businessId) {
        Business business = businessRepository.findById(businessId).orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        business.setStatus(BusinessStatus.AVAILABLE);
        return businessRepository.save(business);
    }
}
