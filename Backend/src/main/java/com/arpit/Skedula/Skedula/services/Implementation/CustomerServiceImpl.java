package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.CustomerDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.CustomerRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static org.modelmapper.Converters.Collection.map;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Override
    public CustomerDTO createCustomer(User user) {
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerId(generateCustomerId());
        customer.setAppointments(null);
        customerRepository.save(customer);
        return entityToDTO(customer, user.getId());
    }


    @Override
    public CustomerDTO getCurrentCustomer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
        Customer customer = customerRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + email));
        return entityToDTO(customer, user.getId());
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

    @Override
    public boolean isOwnerOfProfile(Long id) {

        User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user == null) {
            throw new ResourceNotFoundException("User not found in security context");
        }
        if(!user.getRoles().contains(Role.CUSTOMER)) {
            throw new ResourceNotFoundException("User is not a customer");
        }
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customer.getUser().getEmail().equals(user.getEmail());
    }

    @Override
    public boolean isOwnerOfAppointment(Long appointmentId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user == null) {
            throw new ResourceNotFoundException("User not found in security context");
        }
        if (!user.getRoles().contains(Role.CUSTOMER)) {
            throw new ResourceNotFoundException("User is not a customer");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Customer customer = customerRepository.findById(appointment.getBookedBy().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy().getId()));
        return customer.getUser().getEmail().equals(user.getEmail());
    }

    private String generateCustomerId() {
        String customerId = "SKECS" + UUID.randomUUID().toString().replace("-", "");
        if (customerRepository.existsByCustomerId(customerId)){
            return generateCustomerId();
        }
        return customerId;
    }

    private CustomerDTO entityToDTO(Customer customer, Long userId) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setCustomerId(customer.getCustomerId());
        dto.setUser(userId);
        dto.setAppointments(customer.getAppointments());
        return dto;
    }

}
