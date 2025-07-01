package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.CustomerDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public interface CustomerService {

    CustomerDTO createCustomer(UserDTO userDTO);

    CustomerDTO getCustomerById(Long id);

    Page<CustomerDTO> getCustomer(Integer pageOffset, Integer pageSize);

    boolean isOwnerOfProfile(Long id);

    boolean isOwnerOfAppointment(Long appointmentId);

}
