package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
public interface BusinessService{


    Page<BusinessDTO> getAllBusiness(Integer pageOffset, Integer pageSize);

    BusinessDTO register(BusinessDTO businessDTO);

    BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO);

    Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword);
}
