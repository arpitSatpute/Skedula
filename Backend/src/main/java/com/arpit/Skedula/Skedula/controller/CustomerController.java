package com.arpit.Skedula.Skedula.controller;


import com.arpit.Skedula.Skedula.dto.CustomerDTO;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/customer")
@RequiredArgsConstructor
@Secured("ROLE_CUSTOMER")
public class CustomerController {

    private final CustomerService customerService;

    // Get Customer by ID

    @PreAuthorize("@customerService.isOwnerOfProfile(#id)")
    @GetMapping("/get/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    // Get All Customers  for Admin
    @GetMapping("/get")
    public ResponseEntity<Page<CustomerDTO>> getCustomer(@RequestParam(defaultValue = "0") Integer pageOffset,
                                                         @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(customerService.getCustomer(pageOffset, pageSize));
    }

    @GetMapping("/get/currentCustomer")
    public ResponseEntity<CustomerDTO> getCurrentCustomer() {
        return ResponseEntity.ok(customerService.getCurrentCustomer()); // Assuming 1L is the current customer ID, replace with actual logic to get current customer
    }



    // Create / Register Customer // Public Routes  // Done while signup

    // Update Details By ID

    // Remove Customer


    // Get Appointments by Customer ID



}
