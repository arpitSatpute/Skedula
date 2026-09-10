package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessServiceOfferedCard;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import com.arpit.Skedula.Skedula.services.CacheService;
import com.fasterxml.jackson.core.type.TypeReference;
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
import java.time.Duration;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
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
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final CacheService cacheService;

    private String cleanAndDeduplicateImageUrls(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return null;
        }
        LinkedHashSet<String> set = Arrays.stream(imageUrl.split("[,;\\n]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/") || s.startsWith("data:") || s.startsWith("blob:")))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (set.isEmpty()) {
            return null;
        }
        return String.join(",", set);
    }

    private List<String> extractImageList(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(imageUrl.split("[,;\\n]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/") || s.startsWith("data:") || s.startsWith("blob:")))
                .distinct()
                .collect(Collectors.toList());
    }

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
        LinkedHashSet<String> urls = new LinkedHashSet<>(extractImageList(businessServiceOffered.getImageUrl()));
        if (fileUrl != null && !fileUrl.trim().isEmpty()) {
            urls.add(fileUrl.trim());
        }
        businessServiceOffered.setImageUrl(urls.isEmpty() ? null : String.join(",", urls));
        businessServiceOfferedRepository.save(businessServiceOffered);
        cacheService.delete("v1:service:id:" + id);
        if (businessServiceOffered.getBusiness() != null) {
            cacheService.deleteByPattern("v1:services:biz:" + businessServiceOffered.getBusiness().getId() + "*");
        }
        cacheService.deleteByPattern("v1:business:*");
        System.out.println("file set: -------------------------------------------------------------");

        return null;
    }

    @Override
    public Void setFiles(List<MultipartFile> multipartFiles, Long id) {
        BusinessServiceOffered businessServiceOffered = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        LinkedHashSet<String> urls = new LinkedHashSet<>(extractImageList(businessServiceOffered.getImageUrl()));

        if (multipartFiles != null) {
            for (MultipartFile file : multipartFiles) {
                if (file != null && !file.isEmpty()) {
                    String url = uploadFile(file);
                    if (url != null && !url.trim().isEmpty()) {
                        urls.add(url.trim());
                    }
                }
            }
        }
        businessServiceOffered.setImageUrl(urls.isEmpty() ? null : String.join(",", urls));
        businessServiceOfferedRepository.save(businessServiceOffered);
        cacheService.delete("v1:service:id:" + id);
        if (businessServiceOffered.getBusiness() != null) {
            cacheService.deleteByPattern("v1:services:biz:" + businessServiceOffered.getBusiness().getId() + "*");
        }
        cacheService.deleteByPattern("v1:business:*");
        return null;
    }


    @Override
    public List<BusinessServiceOfferedDTO> getAllServices() {
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findAll();
        return services.stream()
                .map(this::convertToDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public BusinessServiceOfferedDTO createService(OnBoardBusinessServiceOfferedDTO serviceOfferedDTO) {

        BusinessServiceOffered businessServiceOffered = new BusinessServiceOffered();

        Business business = businessRepository.findById(serviceOfferedDTO.getBusiness()).orElseThrow(()-> new ResourceNotFoundException("Business not found"));
        if(business.getStatus().equals(BusinessStatus.UNAVAILABLE)) {
            throw new RuntimeException("Business is not available to add services");
        }
        if(business.getServiceOffered().contains(serviceOfferedDTO.getName())){
            throw new RuntimeException("Business service named " + serviceOfferedDTO.getName() + "already exists");
        }

        businessServiceOffered.setBusiness(business);
        businessServiceOffered.setServiceOfferedId(generateServiceOfferedId());
        businessServiceOffered.setName(serviceOfferedDTO.getName());
        businessServiceOffered.setDescription(serviceOfferedDTO.getDescription());
        businessServiceOffered.setPrice(serviceOfferedDTO.getPrice());
        businessServiceOffered.setTotalSlots(serviceOfferedDTO.getTotalSlots());
        businessServiceOffered.setDuration(serviceOfferedDTO.getDuration());
        businessServiceOffered.setImageUrl(null);
        businessServiceOffered.setStatus(ServiceStatus.AVAILABLE);

        businessServiceOfferedRepository.save(businessServiceOffered);

        cacheService.deleteByPattern("v1:services:biz:" + serviceOfferedDTO.getBusiness() + "*");
        cacheService.deleteByPattern("v1:business:*");

        BusinessServiceOfferedDTO result = new BusinessServiceOfferedDTO();
        result.setId(businessServiceOffered.getId());
        result.setBusiness(businessServiceOffered.getBusiness().getId());
        result.setName(businessServiceOffered.getName());
        result.setDescription(businessServiceOffered.getDescription());
        result.setPrice(businessServiceOffered.getPrice());
        result.setTotalSlots(businessServiceOffered.getTotalSlots());
        result.setDuration(businessServiceOffered.getDuration());
        result.setServiceOfferedId(businessServiceOffered.getServiceOfferedId());
        result.setStatus(businessServiceOffered.getStatus());
        result.setImageUrl(null);

        System.out.println("Service created: -------------------------------------------------------------");


        return result;
    }



    @Override
    public BusinessServiceOfferedDTO getServiceById(Long id) {
        String cacheKey = "v1:service:id:" + id;
        return cacheService.getOrLoad(cacheKey, BusinessServiceOfferedDTO.class, Duration.ofMinutes(10), () -> {
            BusinessServiceOffered service = businessServiceOfferedRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
            if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
                throw new ResourceNotFoundException("Service is currently unavailable");
            }
            return convertToDTO(service);
        });
    }

    @Override
    public Page<BusinessServiceOfferedDTO> getServiceByKeyword(Integer pageOffset, Integer pageSize, String keyword){
        return businessServiceOfferedRepository.findByKeyword(keyword, PageRequest.of(pageOffset, pageSize))
                .map(this::convertToDTO);
    }


    @Override
    public Void deleteService(Long id) {
        BusinessServiceOffered service = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        List<Appointment> appointments = appointmentRepository.findByServiceOffered_Id(id);
        if (appointments != null && !appointments.isEmpty()) {
            appointmentService.cancelAllAppointmentsByServiceOfferedId(id);
        }
        service.setStatus(ServiceStatus.UNAVAILABLE);
//        service.setName(null);
//        service.setBusiness(null);
//        service.setServiceOfferedId(null);
        businessServiceOfferedRepository.save(service);
        cacheService.delete("v1:service:id:" + id);
        if (service.getBusiness() != null) {
            cacheService.deleteByPattern("v1:services:biz:" + service.getBusiness().getId() + "*");
        }
        cacheService.deleteByPattern("v1:business:*");
        return null;
    }

    @Override
    public BusinessServiceOfferedDTO updateService(Long id, OnBoardBusinessServiceOfferedDTO serviceOfferedDTO) {
        System.out.println(serviceOfferedDTO);
        BusinessServiceOffered existingService = businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        existingService.setName(serviceOfferedDTO.getName());
        existingService.setStatus(ServiceStatus.AVAILABLE);
        existingService.setDescription(serviceOfferedDTO.getDescription());
        existingService.setPrice(serviceOfferedDTO.getPrice());
        existingService.setTotalSlots(serviceOfferedDTO.getTotalSlots());
        existingService.setDuration(serviceOfferedDTO.getDuration());
        existingService.setImageUrl(cleanAndDeduplicateImageUrls(serviceOfferedDTO.getImageUrl()));
        Business business = businessRepository.findById(serviceOfferedDTO.getBusiness())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + serviceOfferedDTO.getBusiness()));
        existingService.setBusiness(business);
        businessServiceOfferedRepository.save(existingService);

        cacheService.delete("v1:service:id:" + id);
        cacheService.deleteByPattern("v1:services:biz:" + serviceOfferedDTO.getBusiness() + "*");
        cacheService.deleteByPattern("v1:business:*");

        return convertToDTO(existingService);
    }

    @Override
    public List<BusinessServiceOfferedDTO> getServiceByUser(){
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Owner_EmailAndStatus(user.getEmail(), ServiceStatus.AVAILABLE);
        if (services == null) {
            throw new ResourceNotFoundException("No services found for the user: " + user.getEmail());
        }

        return services.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusinessServiceOfferedCard> getServiceByBusinessId(Long businessId) {
        String cacheKey = "v1:services:biz:" + businessId;
        return cacheService.getOrLoad(cacheKey, new TypeReference<List<BusinessServiceOfferedCard>>() {}, Duration.ofMinutes(5), () -> {
            Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

            if(business.getStatus() == BusinessStatus.UNAVAILABLE) {
                throw new ResourceNotFoundException("Business is currently unavailable");
            }

            List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_IdAndStatus(businessId, ServiceStatus.AVAILABLE);
            if (services == null || services.isEmpty()) {
                return null;
            }
            return services.stream()
                    .map(this::convertToCard)
                    .collect(Collectors.toList());
        });
    }

    @Override
    public void unavailableAllServicesByBusinessId(Long id) {
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_IdAndStatus(id, ServiceStatus.AVAILABLE);
        if (services == null || services.isEmpty()) {
            return;
        }
        for(BusinessServiceOffered service : services) {
            service.setStatus(ServiceStatus.UNAVAILABLE);
            businessServiceOfferedRepository.save(service);
        }
        cacheService.deleteByPattern("v1:services:biz:" + id + "*");
        cacheService.deleteByPattern("v1:service:id:*");
    }


    public BusinessServiceOfferedDTO convertToDTO(BusinessServiceOffered services) {
        if(services.getStatus() == ServiceStatus.UNAVAILABLE) {
            return null;
        }

        BusinessServiceOfferedDTO dto = new BusinessServiceOfferedDTO();
        dto.setId(services.getId());
        dto.setServiceOfferedId(services.getServiceOfferedId());
        dto.setName(services.getName());
        dto.setDescription(services.getDescription());
        dto.setPrice(services.getPrice());
        dto.setTotalSlots(services.getTotalSlots());
        dto.setDuration(services.getDuration());
        String cleanImageUrl = cleanAndDeduplicateImageUrls(services.getImageUrl());
        dto.setImageUrl(cleanImageUrl);
        dto.setImageUrls(extractImageList(cleanImageUrl));
        if (services.getBusiness() != null) { 
            dto.setBusiness(services.getBusiness().getId()); 
            dto.setBusinessName(services.getBusiness().getName()); 
            dto.setCategory(services.getBusiness().getCategory() != null ? services.getBusiness().getCategory() : "Spa & Wellness"); 
        }
        dto.setStatus(services.getStatus());

        return dto;
    }

    private BusinessServiceOfferedCard convertToCard(BusinessServiceOffered services) {
        BusinessServiceOfferedCard card = new BusinessServiceOfferedCard();
        card.setId(services.getId());
        card.setServiceOfferedId(services.getServiceOfferedId());
        card.setName(services.getName());
        card.setDescription(services.getDescription());
        card.setPrice(services.getPrice());
        card.setTotalSlots(services.getTotalSlots());
        card.setDuration(services.getDuration());
        String cleanImageUrl = cleanAndDeduplicateImageUrls(services.getImageUrl());
        card.setImageUrl(cleanImageUrl);
        card.setImageUrls(extractImageList(cleanImageUrl));
        card.setStatus(services.getStatus()); 
        if (services.getBusiness() != null) { 
            card.setBusinessId(services.getBusiness().getId()); 
            card.setBusinessName(services.getBusiness().getName()); 
            card.setCategory(services.getBusiness().getCategory() != null ? services.getBusiness().getCategory() : "Spa & Wellness"); 
        }

        return card;
    }

    private BusinessServiceOffered convertToEntity(BusinessServiceOfferedDTO dto) {
        BusinessServiceOffered entity = new BusinessServiceOffered();
        entity.setId(dto.getId());
        entity.setServiceOfferedId(dto.getServiceOfferedId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setTotalSlots(dto.getTotalSlots());
        entity.setDuration(dto.getDuration());
        entity.setImageUrl(dto.getImageUrl());
        entity.setStatus(dto.getStatus());

        Business business = businessRepository.findById(dto.getBusiness())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + dto.getBusiness()));
        entity.setBusiness(business);

        return entity;
    }

    private String generateServiceOfferedId() {
        String prefix = "SO";
        long count = businessServiceOfferedRepository.count() + 1; // Start from 1
        return prefix + count;
    }

}
