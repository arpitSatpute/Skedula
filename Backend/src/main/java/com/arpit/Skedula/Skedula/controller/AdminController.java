package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Secured("ROLE_ADMIN")
public class AdminController {

    private final AdminService adminService;

    @PutMapping("/lock/business/{businessId}")
    public ResponseEntity<Void> changeBusinessAvailability(@PathVariable Long businessId) {
        // Logic to change business availability
        return ResponseEntity.ok(adminService.changeBusinessAvailability(businessId));
    }

    @PutMapping("/lock/service/{serviceId}")
    public ResponseEntity<Void> changeServiceAvailability(@PathVariable Long serviceId) {
        // Logic to change service availability
        return ResponseEntity.ok(adminService.changeServiceAvailability(serviceId));
    }

    @PutMapping("/unlock/business/{serviceId}")
    public ResponseEntity<Business> makeBusinessAvailable(@PathVariable Long businessId) {
        Business updatedBusiness = adminService.makeBusinessAvailable(businessId);
        return ResponseEntity.ok(updatedBusiness);
    }

    @PutMapping("/unlock/service/{serviceId}")
    public ResponseEntity<BusinessServiceOffered> makeServiceAvailable(@PathVariable Long serviceId) {
        BusinessServiceOffered updatedService = adminService.makeServiceAvailable(serviceId);
        return ResponseEntity.ok(updatedService);
    }



}
