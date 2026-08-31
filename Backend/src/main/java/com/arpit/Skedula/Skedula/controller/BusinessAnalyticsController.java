package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessAnalyticsDTO;
import com.arpit.Skedula.Skedula.services.Implementation.BusinessAnalyticsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/business/analytics")
@RequiredArgsConstructor
public class BusinessAnalyticsController {

    private final BusinessAnalyticsServiceImpl analyticsService;

    /**
     * Returns the full analytics payload for the given business.
     * Only the owner of that business can call this endpoint.
     */
    @Secured("ROLE_OWNER")
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessAnalyticsDTO> getAnalytics(@PathVariable Long businessId) {
        return ResponseEntity.ok(analyticsService.getAnalytics(businessId));
    }
}
