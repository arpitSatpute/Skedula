package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import org.springframework.stereotype.Service;

@Service
public interface AdminService {


    Void changeBusinessAvailability(Long businessId);

    Void changeServiceAvailability(Long serviceId);

    Business makeBusinessAvailable(Long businessId);

    BusinessServiceOffered makeServiceAvailable(Long serviceId);
}
