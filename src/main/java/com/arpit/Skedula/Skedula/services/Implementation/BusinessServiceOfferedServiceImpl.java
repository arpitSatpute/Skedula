package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BusinessServiceOfferedServiceImpl implements BusinessServiceOfferedService {

    private final BusinessServiceOfferedRepository serviceOfferedRepository;
    private final ModelMapper mapper;
    private final BusinessRepository businessRepository;

    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<BusinessServiceOfferedDTO> getAllServices(Integer pageOffset, Integer pageSize) {
        return businessServiceOfferedRepository.findAll(PageRequest.of(pageOffset, pageSize))
                .map(service -> modelMapper.map(service, BusinessServiceOfferedDTO.class));
    }

    @Override
    public BusinessServiceOfferedDTO createService(OnBoardBusinessServiceOfferedDTO serviceOfferedDTO) {

        BusinessServiceOffered businessServiceOffered = new BusinessServiceOffered();

        Business business = businessRepository.findById(serviceOfferedDTO.getBusiness()).orElseThrow(()-> new ResourceNotFoundException("Business not found"));

        if(business.getServiceOffered().contains(serviceOfferedDTO.getName())){
            throw new RuntimeException("Business service named " + serviceOfferedDTO.getName() + "already exists");
        }

        businessServiceOffered.setBusiness(business);
        businessServiceOffered.setName(serviceOfferedDTO.getName());
        businessServiceOffered.setDescription(serviceOfferedDTO.getDescription());
        businessServiceOffered.setPrice(serviceOfferedDTO.getPrice());
        businessServiceOffered.setTotalSlots(serviceOfferedDTO.getTotalSlots());
        businessServiceOffered.setDuration(serviceOfferedDTO.getDuration());
        businessServiceOffered.setImageUrl(serviceOfferedDTO.getImageUrl());




        businessServiceOfferedRepository.save(businessServiceOffered);

        BusinessServiceOfferedDTO result = new BusinessServiceOfferedDTO();
        result.setId(businessServiceOffered.getId());
        result.setBusiness(businessServiceOffered.getBusiness().getId());
        result.setName(businessServiceOffered.getName());
        result.setDescription(businessServiceOffered.getDescription());
        result.setPrice(businessServiceOffered.getPrice());
        result.setTotalSlots(businessServiceOffered.getTotalSlots());
        result.setDuration(businessServiceOffered.getDuration());
        result.setImageUrl(businessServiceOffered.getImageUrl());


        return result;
    }

    @Override
    public BusinessServiceOfferedDTO getServiceById(Long id) {
        return businessServiceOfferedRepository.findById(id)
                .map(service -> modelMapper.map(service, BusinessServiceOfferedDTO.class))
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    @Override
    public Page<BusinessServiceOfferedDTO> getServiceByKeyword(Integer pageOffset, Integer pageSize, String keyword){
        return businessServiceOfferedRepository.findByKeyword(keyword, PageRequest.of(pageOffset, pageSize))
                .map(service -> modelMapper.map(service, BusinessServiceOfferedDTO.class));
    }


    @Override
    public void deleteService(Long id) {
        BusinessServiceOffered service = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        businessServiceOfferedRepository.delete(service);
    }

    @Override
    public BusinessServiceOfferedDTO updateService(Long id, BusinessServiceOfferedDTO serviceOfferedDTO) {
        BusinessServiceOffered existingService = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        modelMapper.map(serviceOfferedDTO, existingService);
        businessServiceOfferedRepository.save(existingService);

        return modelMapper.map(existingService, BusinessServiceOfferedDTO.class);
    }

}
