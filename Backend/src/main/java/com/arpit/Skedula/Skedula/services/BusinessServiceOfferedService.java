package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface BusinessServiceOfferedService {

    Page<BusinessServiceOfferedDTO> getAllServices(Integer pageOffset, Integer pageSize);

    BusinessServiceOfferedDTO createService(OnBoardBusinessServiceOfferedDTO businessServiceOfferedDTO);

    BusinessServiceOfferedDTO getServiceById(Long id);

    Void deleteService(Long id);

    Page<BusinessServiceOfferedDTO> getServiceByKeyword(Integer pageOffset, Integer pageSize, String keyword);

    BusinessServiceOfferedDTO updateService(Long id, OnBoardBusinessServiceOfferedDTO serviceOfferedDTO);

    String uploadFile(MultipartFile multipartFile);

    Void setFile(MultipartFile multipartFile, Long id);

    List<BusinessServiceOfferedDTO> getServiceByUser();

    BusinessServiceOfferedDTO convertToDTO(BusinessServiceOffered services);
}
