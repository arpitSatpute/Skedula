package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.CustomerDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.CustomerRepository;
import com.arpit.Skedula.Skedula.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import static org.modelmapper.Converters.Collection.map;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;

    @Override
    public CustomerDTO createCustomer(UserDTO userDTO) {
        Customer customer = new Customer();
        customer.setUser(modelMapper.map(userDTO, User.class));
        customerRepository.save(customer);
        return modelMapper.map(customer, CustomerDTO.class);
    }

    @Override
    public CustomerDTO getCustomerById(Long id) {
        return modelMapper.map(customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found")), CustomerDTO.class);
    }

    @Override
    public Page<CustomerDTO> getCustomer(Integer pageOffset, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageOffset, pageSize);
        Page<Customer> customerPage = customerRepository.findAll(pageable);
        return customerPage.map(customer -> modelMapper.map(customer, CustomerDTO.class));
    }
}
