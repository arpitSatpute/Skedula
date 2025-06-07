package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.services.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/business")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    // Create / Register Business // Public Routes
    @PostMapping("/register")
    public ResponseEntity<BusinessDTO> register(@RequestBody BusinessDTO businessDTO) {
        return ResponseEntity.ok(businessService.register(businessDTO));
    }

    // Update Details By ID
    @PutMapping("/update/{id}")
    public ResponseEntity<BusinessDTO> update(@PathVariable Long id, @RequestBody BusinessDTO businessDTO) {
        return ResponseEntity.ok(businessService.updateBusiness(id, businessDTO));
    }
    // Remove service

    // Get All Services // Public Routes


    // Get Booked Services


}
