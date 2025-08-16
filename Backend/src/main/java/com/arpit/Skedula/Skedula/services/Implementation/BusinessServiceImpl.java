package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.BusinessService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;



@Service("businessService")
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final ModelMapper modelMapper;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final AppointmentService appointmentService;
    private final BusinessServiceOfferedService businessServiceOfferedService;


    @Override
    public Page<BusinessCard> getAllBusiness(Integer pageOffset, Integer pageSize) {
        Page<Business> businessPage = businessRepository.findAll(PageRequest.of(pageOffset, pageSize));
        List<BusinessCard> card = businessPage.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
        return new PageImpl<>(card, businessPage.getPageable(), businessPage.getTotalElements());
    }

    @Override
    public BusinessCard getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        return convertToCard(business);
    }


    @Override
    public BusinessDTO register(BusinessDTO businessDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        if(!(user.getRoles().contains(Role.OWNER))){
            throw new RuntimeException("User is not owner of this business");
        }
        Boolean isExist = businessRepository.existsByName(businessDTO.getName());
        if(isExist){
            throw new RuntimeException("Business with name: " + businessDTO.getName() + " already exists");
        }
        businessDTO.setBusinessId(generateBusinessId());
        Business business = convertToEntity(businessDTO, user);
        businessRepository.save(business);
        BusinessDTO result = convertToDTO(business);
        return result;
    }

    @Override
    public BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Id(id);
        List<Appointment> appoointments = appointmentRepository.findByBusiness_Id(id);

        // Do not allow changing the owner
        business.setName(businessDTO.getName());
        business.setBusinessId(businessDTO.getBusinessId());
        business.setDescription(businessDTO.getDescription());
        business.setAddress(businessDTO.getAddress());
        business.setCity(businessDTO.getCity());
        business.setState(businessDTO.getState());
        business.setCountry(businessDTO.getCountry());
        business.setPhone(businessDTO.getPhone());
        business.setEmail(businessDTO.getEmail());
        business.setZipCode(businessDTO.getZipCode());
        business.setMapLink(businessDTO.getMapLink());
        business.setCRNNumber(businessDTO.getCRNNumber());
        business.setGSTNumber(businessDTO.getGSTNumber());
        business.setOpenTime(businessDTO.getOpenTime());
        business.setCloseTime(businessDTO.getCloseTime());
        business.setIdentity(businessDTO.getIdentity());
        business.setAppointments(appoointments);
        business.setServiceOffered(services);

        // Save updated business
        businessRepository.save(business);
        return convertToDTO(business);
    }

    @Override
    public Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageOffset, pageSize);
        Page<Business> bussinessPage = businessRepository.findByKeyword(keyword, pageable);
        return bussinessPage.map(business -> modelMapper.map(business, BusinessDTO.class));
    }


    @Override
    public BusinessDTO getBusinessByUser() {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUser)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + currentUser));
        if(!currentUser.equals(user.getEmail())){
            throw new RuntimeException("User is not authorized to access this business");
        }
        if(!(user.getRoles().contains(Role.OWNER))){
            throw new RuntimeException("User is not enrolled for OWNER Role ");
        }

        Business business = businessRepository.findByOwner_Id(user.getId()).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + user.getId()));
        return convertToDTO(business);
    }

    @Override
    public boolean isOwnerOfProfile(Long businessId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        String owner = business.getOwner().getEmail();
        if (!business.getOwner().getRoles().contains(Role.OWNER)) {
            throw new RuntimeException("User is not enrolled for OWNER Role ");
        }
        return owner.equals(email);
    }

    @Override
    public boolean isCurrentUser(Long userId) {
        String useremail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));
        if(!user.getRoles().contains(Role.OWNER)){
            throw new RuntimeException("User is not enrolled for OWNER Role ");
        }
        return user.getEmail().equals(useremail);
    }


    @Override
    public boolean isOwnerOfAppointment(Long appointmentId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));
        Business business = businessRepository.findByAppointments(appointment).orElseThrow(() -> new RuntimeException("Business not found for appointment with id: " + appointmentId));

        if(!user.getRoles().contains(Role.OWNER)){
            throw new RuntimeException("User is not enrolled for OWNER Role ");
        }

        return business.getOwner().getEmail().equals(user.getEmail());

    }

    @Override
    public boolean isOwnerOfService(Long serviceId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId).orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));
        Business business = businessRepository.findById(serviceOffered.getBusiness().getId()).orElseThrow(() -> new RuntimeException("Business not found for service with id: " + serviceOffered.getBusiness()));

        if(!user.getRoles().contains(Role.OWNER)){
            throw new RuntimeException("User is not enrolled for OWNER Role ");
        }
        return business.getOwner().getEmail().equals(user.getEmail());

    }

    public void removeBusinessById(Long id) {
        businessRepository.deleteById(id);
    }


    private Business convertToEntity(BusinessDTO businessDTO, User user) {

        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Id(businessDTO.getId());
        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(businessDTO.getId());

        Business business = new Business();
        business.setOwner(user);
        business.setBusinessId(businessDTO.getBusinessId());
        business.setName(businessDTO.getName());
        business.setDescription(businessDTO.getDescription());
        business.setAddress(businessDTO.getAddress());
        business.setCity(businessDTO.getCity());
        business.setState(businessDTO.getState());
        business.setCountry(businessDTO.getCountry());
        business.setPhone(businessDTO.getPhone());
        business.setEmail(businessDTO.getEmail());
        business.setZipCode(businessDTO.getZipCode());
        business.setMapLink(businessDTO.getMapLink());
        business.setCRNNumber(businessDTO.getCRNNumber());
        business.setGSTNumber(businessDTO.getGSTNumber());
        business.setOpenTime(businessDTO.getOpenTime());
        business.setIdentity(businessDTO.getIdentity());
        business.setCloseTime(businessDTO.getCloseTime());
        business.setServiceOffered(services);
        business.setAppointments(appointments);


        return business;

    }

    private BusinessDTO convertToDTO(Business business) {

        List<BusinessServiceOffered> services = businessServiceOfferedRepository.findByBusiness_Id(business.getId());
        List<BusinessServiceOfferedDTO> serviceDTO = services.stream()
                .map(businessServiceOfferedService::convertToDTO)
                .collect(Collectors.toList());

        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(business.getId());
        List<AppointmentDTO> appointmentDTO = appointments.stream()
                .map(appointmentService::convertToDTO)
                .collect(Collectors.toList());

        BusinessDTO businessDTO = new BusinessDTO();
        businessDTO.setId(business.getId());
        businessDTO.setBusinessId(business.getBusinessId());
        businessDTO.setOwner(business.getOwner().getId());
        businessDTO.setName(business.getName());
        businessDTO.setDescription(business.getDescription());
        businessDTO.setAddress(business.getAddress());
        businessDTO.setCity(business.getCity());
        businessDTO.setState(business.getState());
        businessDTO.setCountry(business.getCountry());
        businessDTO.setPhone(business.getPhone());
        businessDTO.setEmail(business.getEmail());
        businessDTO.setZipCode(business.getZipCode());
        businessDTO.setMapLink(business.getMapLink());
        businessDTO.setCRNNumber(business.getCRNNumber());
        businessDTO.setGSTNumber(business.getGSTNumber());
        businessDTO.setIdentity(business.getIdentity());
        businessDTO.setOpenTime(business.getOpenTime());
        businessDTO.setCloseTime(business.getCloseTime());
        businessDTO.setServiceOffered(serviceDTO);
        businessDTO.setAppointments(appointmentDTO);

        return businessDTO;

    }

    private BusinessCard convertToCard(Business business) {
        BusinessCard businessCard = new BusinessCard();
        businessCard.setId(business.getId());
        businessCard.setBusinessId(business.getBusinessId());
        businessCard.setName(business.getName());
        businessCard.setDescription(business.getDescription());
        businessCard.setAddress(business.getAddress());
        businessCard.setCity(business.getCity());
        businessCard.setState(business.getState());
        businessCard.setCountry(business.getCountry());
        businessCard.setPhone(business.getPhone());
        businessCard.setEmail(business.getEmail());
        businessCard.setZipCode(business.getZipCode());
        businessCard.setMapLink(business.getMapLink());
        businessCard.setOpenTime(business.getOpenTime());
        businessCard.setCloseTime(business.getCloseTime());

        return businessCard;
    }

    private String generateBusinessId() {
        String prefix = "SBE";
        String uniqueId = String.valueOf(System.currentTimeMillis());
        return prefix + uniqueId;
    }




}
