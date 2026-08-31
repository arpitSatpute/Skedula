package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.dto.AdminAnalyticsDTO;
import com.arpit.Skedula.Skedula.dto.AdminServiceDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Secured("ROLE_ADMIN")
public class AdminController {

    private final AdminService adminService;

    // Platform Analytics
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsDTO> getPlatformAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    // Business Management
    @GetMapping("/businesses")
    public ResponseEntity<List<BusinessCard>> getAllBusinesses(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllBusinesses(status, search));
    }

    @PutMapping("/business/{businessId}/approve")
    public ResponseEntity<Business> makeBusinessAvailable(@PathVariable Long businessId) {
        return ResponseEntity.ok(adminService.makeBusinessAvailable(businessId));
    }

    @PutMapping("/business/{businessId}/lock")
    public ResponseEntity<Void> changeBusinessAvailability(@PathVariable Long businessId) {
        return ResponseEntity.ok(adminService.changeBusinessAvailability(businessId));
    }

    @DeleteMapping("/business/{businessId}")
    public ResponseEntity<Void> deleteBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(adminService.deleteBusiness(businessId));
    }

    // Service Management
    @GetMapping("/services")
    public ResponseEntity<List<AdminServiceDTO>> getAllServices(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(adminService.getAllServices(status));
    }

    @PutMapping("/service/{serviceId}/lock")
    public ResponseEntity<Void> changeServiceAvailability(@PathVariable Long serviceId) {
        return ResponseEntity.ok(adminService.changeServiceAvailability(serviceId));
    }

    @PutMapping("/service/{serviceId}/unlock")
    public ResponseEntity<BusinessServiceOffered> makeServiceAvailable(@PathVariable Long serviceId) {
        return ResponseEntity.ok(adminService.makeServiceAvailable(serviceId));
    }

    @DeleteMapping("/service/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(adminService.deleteService(serviceId));
    }

    // Platform Users
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/user/{userId}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Role role,
            @RequestParam(defaultValue = "true") boolean addRole) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, role, addRole));
    }
}
