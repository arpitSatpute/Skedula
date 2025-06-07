package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.BusinessService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final ModelMapper modelMapper;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    @Override
    public Page<BusinessDTO> getAllBusiness(Integer pageOffset, Integer pageSize){

        return businessRepository.findAll(PageRequest.of(pageOffset, pageSize)).map(business -> modelMapper.map(business, BusinessDTO.class));

    }

    @Override
    @Transactional
    public BusinessDTO register(BusinessDTO businessDTO) {
        User user = userRepository.findById(businessDTO.getOwner())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + businessDTO.getOwner()));
        if(!(user.getRoles().contains(Role.OWNER))){
            throw new RuntimeException("User is not owner of this business");
        }
        Boolean isExist = businessRepository.existsByName(businessDTO.getName());
        if(isExist){
            throw new RuntimeException("Business with name: " + businessDTO.getName() + " already exists");
        }

        Business business = convertToEntity(businessDTO, user);

        businessRepository.save(business);


        BusinessDTO result = convertToDTO(business);

        return result;

    }

    @Override
    public BusinessDTO updateBusiness(Long id, BusinessDTO businessDTO) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
        User user = userRepository.findById(businessDTO.getOwner()).orElseThrow(() -> new RuntimeException("User not found with id: " + businessDTO.getOwner()));
        Business updated = convertToEntity(businessDTO, user);

        return convertToDTO(businessRepository.save(updated));
    }


    @Override
    public Page<BusinessDTO> getBusinessByKeyword(Integer pageOffset, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageOffset, pageSize);
        Page<Business> bussinessPage = businessRepository.findByKeyword(keyword, pageable);
        return bussinessPage.map(business -> modelMapper.map(business, BusinessDTO.class));
    }

    private Business convertToEntity(BusinessDTO businessDTO, User user) {

        Business business = new Business();
        business.setOwner(user);
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
        business.setCloseTime(businessDTO.getCloseTime());

        return business;

    }

    private BusinessDTO convertToDTO(Business business) {

        BusinessDTO businessDTO = new BusinessDTO();
        businessDTO.setId(business.getId());
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
        businessDTO.setOpenTime(business.getOpenTime());
        businessDTO.setCloseTime(business.getCloseTime());

        return businessDTO;

    }




}
