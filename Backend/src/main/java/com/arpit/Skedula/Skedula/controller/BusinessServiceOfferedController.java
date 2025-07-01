package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.OnBoardBusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/services-offered")
@RequiredArgsConstructor
@Secured("Role_Owner")
public class BusinessServiceOfferedController {

    private final BusinessServiceOfferedService businessServiceOfferedService;

    // Create / Register Service Offered
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessServiceOfferedDTO.getBusiness())")
    @PostMapping("/create")
    public ResponseEntity<BusinessServiceOfferedDTO> create(@RequestBody OnBoardBusinessServiceOfferedDTO businessServiceOfferedDTO) {
        return ResponseEntity.ok(businessServiceOfferedService.createService(businessServiceOfferedDTO));
    }

    // Update Details By ID
    @PreAuthorize("@businessService.isOwnerOfService(#id)")
    @PutMapping("/update/{id}")
    public ResponseEntity<BusinessServiceOfferedDTO> updateService(@PathVariable Long id, @RequestBody BusinessServiceOfferedDTO serviceOfferedDTO) {
        return ResponseEntity.ok(businessServiceOfferedService.updateService(id, serviceOfferedDTO));
    }

    // Remove service
    @PreAuthorize("@businessService.isOwnerOfService(#id)")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        businessServiceOfferedService.deleteService(id);
        return ResponseEntity.ok("Service deleted successfully");

    }

    // Get All Services Offered // Public Routes

    // Get Booked Services

}
