package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.services.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/business")
@RequiredArgsConstructor
//@Secured(/"Role_OWNER")
public class BusinessController {

    private final BusinessService businessService;

    // Create / Register Business // Public Routes

    @PostMapping("/register")
    public ResponseEntity<BusinessDTO> register(@RequestBody BusinessDTO businessDTO) {
        System.out.println("Registering Business with name: " + businessDTO.getName() + " with id: " + businessDTO.getId());
        return ResponseEntity.ok(businessService.register(businessDTO));
    }

    // Update Details By ID
    @PutMapping("/update/{id}")
    @PreAuthorize("@businessService.isOwnerOfProfile(#id)")
    public ResponseEntity<BusinessDTO> update(@PathVariable Long id, @RequestBody BusinessDTO businessDTO) {
        return ResponseEntity.ok(businessService.updateBusiness(id, businessDTO));
    }

    // Get Business by ID
    @PreAuthorize("@businessService.isOwnerOfProfile(#id)")
    @GetMapping("/get/{id}")
    public ResponseEntity<BusinessDTO> getBusinessById(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }

    @PreAuthorize("@businessService.isOwnerOfProfile(#id)")
    @DeleteMapping("/remove/{id}")
    public void removeBusinessById(@PathVariable Long id) {
        businessService.removeBusinessById(id);
    }

    @GetMapping("/get/user")
//    @PreAuthorize("@businessService.isCurrentUser(#id)")
    public ResponseEntity<?> getBusinessByUser() {
        return ResponseEntity.ok(businessService.getBusinessByUser());
    }

    // Remove service

    // Get All Services // Public Routes


    // Get Booked Services


}
