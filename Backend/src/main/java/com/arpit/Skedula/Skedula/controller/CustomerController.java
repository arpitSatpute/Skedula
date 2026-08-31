package com.arpit.Skedula.Skedula.controller;


import com.arpit.Skedula.Skedula.dto.CustomerDTO;
import com.arpit.Skedula.Skedula.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Get a specific customer's profile by ID.
     * Only that customer themselves can read their own profile.
     */
    @Secured("ROLE_CUSTOMER")
    @PreAuthorize("@customerService.isOwnerOfProfile(#id)")
    @GetMapping("/get/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    /**
     * Get all customers (paginated).
     * Restricted to ADMIN only — a customer must never be able to list other customers.
     */
    @Secured("ROLE_ADMIN")
    @GetMapping("/get")
    public ResponseEntity<Page<CustomerDTO>> getCustomer(
            @RequestParam(defaultValue = "0") Integer pageOffset,
            @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(customerService.getCustomer(pageOffset, pageSize));
    }

    /**
     * Get the currently authenticated customer's profile.
     * Derived from the JWT — no path parameter needed.
     */
    @Secured("ROLE_CUSTOMER")
    @GetMapping("/get/currentCustomer")
    public ResponseEntity<CustomerDTO> getCurrentCustomer() {
        return ResponseEntity.ok(customerService.getCurrentCustomer());
    }

}
