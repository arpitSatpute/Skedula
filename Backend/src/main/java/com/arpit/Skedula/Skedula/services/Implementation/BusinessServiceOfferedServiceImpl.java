package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessServiceOfferedCard;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import com.uploadcare.api.Client;
import com.uploadcare.upload.FileUploader;
import com.uploadcare.upload.UploadFailureException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
public class BusinessServiceOfferedServiceImpl implements BusinessServiceOfferedService {

    private final BusinessServiceOfferedRepository serviceOfferedRepository;
    private final ModelMapper mapper;
    private final BusinessRepository businessRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final ModelMapper modelMapper;
    private final Client client;


    @Override
    public String uploadFile(MultipartFile multipartFile) {

        if(multipartFile.isEmpty()){
            throw new RuntimeException("File is empty");
        }
        File tempfile = null;
        try{
            String originalFilename = multipartFile.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));;
            String uniqueName = System.currentTimeMillis() + extension;


            tempfile = File.createTempFile(uniqueName, extension);
            multipartFile.transferTo(tempfile);

            FileUploader uploader = new FileUploader(client, tempfile);
            uploader.store(true);
            com.uploadcare.api.File uploadedFile = uploader.upload();

            return "https://ucarecdn.com/" + uploadedFile.getFileId() + "/";

        } catch (IOException e) {
            throw new RuntimeException("File upload failed due to an I/O error", e);
        } catch (UploadFailureException e) {
            throw new RuntimeException("File upload failed due to Uploadcare error", e);
        } finally {
            if (tempfile != null && tempfile.exists()) {
                tempfile.delete();
            }
        }

    }

    @Override
    public Void setFile(MultipartFile multipartFile, Long id) {
        BusinessServiceOffered businessServiceOffered = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        String fileUrl = uploadFile(multipartFile);
        businessServiceOffered.setImageUrl(fileUrl);
        businessServiceOfferedRepository.save(businessServiceOffered);
        System.out.println("file set: -------------------------------------------------------------");

        return null;
    }


    @Override
    public List<BusinessServiceOfferedDTO> getAllServices() {
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findAll();
        return services.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
        businessServiceOffered.setImageUrl(null);

        businessServiceOfferedRepository.save(businessServiceOffered);

        BusinessServiceOfferedDTO result = new BusinessServiceOfferedDTO();
        result.setId(businessServiceOffered.getId());
        result.setBusiness(businessServiceOffered.getBusiness().getId());
        result.setName(businessServiceOffered.getName());
        result.setDescription(businessServiceOffered.getDescription());
        result.setPrice(businessServiceOffered.getPrice());
        result.setTotalSlots(businessServiceOffered.getTotalSlots());
        result.setDuration(businessServiceOffered.getDuration());
        result.setImageUrl(null);

        System.out.println("Service created: -------------------------------------------------------------");


        return result;
    }



    @Override
    public BusinessServiceOfferedDTO getServiceById(Long id) {
        BusinessServiceOffered service = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return convertToDTO(service);

    }

    @Override
    public Page<BusinessServiceOfferedDTO> getServiceByKeyword(Integer pageOffset, Integer pageSize, String keyword){
        return businessServiceOfferedRepository.findByKeyword(keyword, PageRequest.of(pageOffset, pageSize))
                .map(service -> modelMapper.map(service, BusinessServiceOfferedDTO.class));
    }


    @Override
    public Void deleteService(Long id) {
        BusinessServiceOffered service = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        businessServiceOfferedRepository.delete(service);
        return null;
    }

    @Override
    public BusinessServiceOfferedDTO updateService(Long id, OnBoardBusinessServiceOfferedDTO serviceOfferedDTO) {
        System.out.println(serviceOfferedDTO);
        BusinessServiceOffered existingService = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        existingService.setName(serviceOfferedDTO.getName());
        existingService.setDescription(serviceOfferedDTO.getDescription());
        existingService.setPrice(serviceOfferedDTO.getPrice());
        existingService.setTotalSlots(serviceOfferedDTO.getTotalSlots());
        existingService.setDuration(serviceOfferedDTO.getDuration());
        Business business = businessRepository.findById(serviceOfferedDTO.getBusiness())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + serviceOfferedDTO.getBusiness()));
        existingService.setBusiness(business);
        businessServiceOfferedRepository.save(existingService);

        return convertToDTO(existingService);
    }

    @Override
    public List<BusinessServiceOfferedDTO> getServiceByUser(){
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Owner_Email(user.getEmail());
        if (services == null) {
            throw new ResourceNotFoundException("No services found for the user: " + user.getEmail());
        }
        return services.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusinessServiceOfferedCard> getServiceByBusinessId(Long businessId) {

        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Id(businessId);
        if (services == null || services.isEmpty()) {
            throw new ResourceNotFoundException("No services found for business with id: " + businessId);
        }
        return services.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());

    }

    public BusinessServiceOfferedDTO convertToDTO(BusinessServiceOffered services) {
        BusinessServiceOfferedDTO dto = new BusinessServiceOfferedDTO();
        dto.setId(services.getId());
        dto.setName(services.getName());
        dto.setDescription(services.getDescription());
        dto.setPrice(services.getPrice());
        dto.setTotalSlots(services.getTotalSlots());
        dto.setDuration(services.getDuration());
        dto.setImageUrl(services.getImageUrl());
        dto.setBusiness(services.getBusiness().getId());

        return dto;
    }

    private BusinessServiceOfferedCard convertToCard(BusinessServiceOffered services) {
        BusinessServiceOfferedCard card = new BusinessServiceOfferedCard();
        card.setId(services.getId());
        card.setName(services.getName());
        card.setDescription(services.getDescription());
        card.setPrice(services.getPrice());
        card.setTotalSlots(services.getTotalSlots());
        card.setDuration(services.getDuration());
        card.setImageUrl(services.getImageUrl());

        return card;
    }

    private BusinessServiceOffered convertToEntity(BusinessServiceOfferedDTO dto) {
        BusinessServiceOffered entity = new BusinessServiceOffered();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setTotalSlots(dto.getTotalSlots());
        entity.setDuration(dto.getDuration());
        entity.setImageUrl(dto.getImageUrl());

        Business business = businessRepository.findById(dto.getBusiness())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + dto.getBusiness()));
        entity.setBusiness(business);

        return entity;
    }



}
