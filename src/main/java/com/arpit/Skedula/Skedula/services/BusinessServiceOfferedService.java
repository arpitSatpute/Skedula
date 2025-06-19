package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface BusinessServiceOfferedService {

    Page<BusinessServiceOfferedDTO> getAllServices(Integer pageOffset, Integer pageSize);

    BusinessServiceOfferedDTO createService(OnBoardBusinessServiceOfferedDTO businessServiceOfferedDTO);

    BusinessServiceOfferedDTO getServiceById(Long id);

    void deleteService(Long id);

    Page<BusinessServiceOfferedDTO> getServiceByKeyword(Integer pageOffset, Integer pageSize, String keyword);

    BusinessServiceOfferedDTO updateService(Long id, BusinessServiceOfferedDTO serviceOfferedDTO);

    String uploadFile(MultipartFile multipartFile);
}
