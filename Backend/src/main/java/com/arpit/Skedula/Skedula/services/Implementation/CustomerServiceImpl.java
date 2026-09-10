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

@Service("customerService")
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
        Customer savedCustomer = customerRepository.save(customer);
        return entityToDTO(savedCustomer, user.getId());
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
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return entityToDTO(customer, customer.getUser().getId());
    }

    @Override
    public Page<CustomerDTO> getCustomer(Integer pageOffset, Integer pageSize) {
        PageRequest pageRequest = PageRequest.of(pageOffset, pageSize);
        return customerRepository.findAll(pageRequest)
                .map(customer -> entityToDTO(customer, customer.getUser().getId()));
    }

    @Override
    public boolean isOwnerOfProfile(Long id) {
        if (id == null) {
            return false;
        }
        if (SecurityContextHolder.getContext().getAuthentication() == null ||
            !(SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof User)) {
            return false;
        }
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getRoles() != null && user.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        if (user.getRoles() == null || !user.getRoles().contains(Role.CUSTOMER)) {
            return false;
        }
        return customerRepository.findById(id)
                .map(cust -> cust.getUser() != null && cust.getUser().getEmail() != null && cust.getUser().getEmail().equals(user.getEmail()))
                .orElse(false);
    }

    @Override
    public boolean isOwnerOfAppointment(Long appointmentId) {
        if (appointmentId == null) {
            return false;
        }
        if (SecurityContextHolder.getContext().getAuthentication() == null ||
            !(SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof User)) {
            return false;
        }
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getRoles() != null && user.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        return appointmentRepository.findById(appointmentId)
                .map(appt -> {
                    if (appt.getBookedBy() == null || appt.getBookedBy().getUser() == null) {
                        return false;
                    }
                    User bookedUser = appt.getBookedBy().getUser();
                    if (bookedUser.getId() == user.getId()) {
                        return true;
                    }
                    return bookedUser.getEmail() != null && bookedUser.getEmail().equalsIgnoreCase(user.getEmail());
                })
                .orElse(false);
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
        if (customer.getUser() != null) {
            dto.setName(customer.getUser().getName());
            dto.setEmail(customer.getUser().getEmail());
            dto.setPhone(customer.getUser().getPhone());
            dto.setDob(customer.getUser().getDob());
            dto.setAddress(customer.getUser().getAddress());
        }
        return dto;
    }

}
