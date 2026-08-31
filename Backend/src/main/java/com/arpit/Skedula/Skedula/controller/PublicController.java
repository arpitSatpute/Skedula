package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.card.BusinessServiceOfferedCard;
import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.dto.BusinessReviewSummaryDTO;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.dto.SlotDTO;
import com.arpit.Skedula.Skedula.services.BusinessService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import com.arpit.Skedula.Skedula.services.ReviewService;
import com.arpit.Skedula.Skedula.services.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(path = "/public")
@RequiredArgsConstructor
public class PublicController {

    private final BusinessService businessService;
    private final BusinessServiceOfferedService businessServiceOfferedService;
    private final SlotService slotService;
    private final ReviewService reviewService;

    // Get All Businesses
    @GetMapping("/getAllBusiness")
    public ResponseEntity<Page<BusinessCard>> getAllBusiness(@RequestParam(defaultValue = "0") Integer pageOffset,
                                                             @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessService.getAllBusiness(pageOffset, pageSize));
    }

    @GetMapping("/getBusiness/{id}")
    public ResponseEntity<BusinessCard> getBusiness(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }

    @GetMapping("/getBusinessBySlug/{slug}")
    public ResponseEntity<BusinessCard> getBusinessBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(businessService.getBusinessBySlug(slug));
    }

    // Nearby / Location-based discovery
    @GetMapping("/businesses/nearby")
    public ResponseEntity<List<BusinessCard>> getNearbyBusinesses(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "10", required = false) Double radius,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state, @RequestParam(required = false) String category) {
        return ResponseEntity.ok(businessService.getNearbyBusinesses(lat, lng, radius, city, state, category));
    }

    // Dynamic Slot Generation
    @GetMapping("/services/{serviceId}/slots")
    public ResponseEntity<List<SlotDTO>> getAvailableSlots(
            @PathVariable Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(slotService.getAvailableSlots(serviceId, date));
    }

    // Public Business Reviews
    @GetMapping("/reviews/business/{businessId}")
    public ResponseEntity<BusinessReviewSummaryDTO> getBusinessReviews(@PathVariable Long businessId) {
        return ResponseEntity.ok(reviewService.getReviewsByBusiness(businessId));
    }

    // Get Services By Paging
    @GetMapping("/getAllServices")
    public ResponseEntity<List<BusinessServiceOfferedDTO>> getAllServices()  {
        return ResponseEntity.ok(businessServiceOfferedService.getAllServices());
    }

    // Get Business By Keyword
    @GetMapping("/getBusinessByKeyword")
    public ResponseEntity<Page<BusinessDTO>> getBusinessByKeyword(@RequestParam String Keyword,
                                                                  @RequestParam(defaultValue = "0") Integer pageOffset,
                                                                  @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessService.getBusinessByKeyword(pageOffset, pageSize, Keyword));
    }

    @GetMapping("getService/{id}")
    public ResponseEntity<BusinessServiceOfferedDTO> getService(@PathVariable Long id) {
        return ResponseEntity.ok(businessServiceOfferedService.getServiceById(id));
    }

    @GetMapping("/getServiceByKeyword")
    public ResponseEntity<Page<BusinessServiceOfferedDTO>> getServiceByKeyword(@RequestParam String Keyword,
                                                                               @RequestParam(defaultValue = "0") Integer pageOffset,
                                                                               @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessServiceOfferedService.getServiceByKeyword(pageOffset, pageSize, Keyword));
    }

    @GetMapping("/getServiceByBusinessId/{id}")
    public ResponseEntity<List<BusinessServiceOfferedCard>> getServiceByBusinessId(@PathVariable Long id) {
        return ResponseEntity.ok(businessServiceOfferedService.getServiceByBusinessId(id));
    }
}
