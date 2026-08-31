package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessReviewSummaryDTO;
import com.arpit.Skedula.Skedula.dto.RequestReviewDTO;
import com.arpit.Skedula.Skedula.dto.ResponseReviewDTO;
import com.arpit.Skedula.Skedula.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a review for a completed appointment.
     * Only customers can submit reviews. The service layer additionally validates
     * that the caller is the customer who actually booked the appointment.
     */
    @Secured("ROLE_CUSTOMER")
    @PostMapping("/create")
    public ResponseEntity<ResponseReviewDTO> createReview(@RequestBody RequestReviewDTO request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    /**
     * Get the review for a specific appointment by appointment ID.
     * Allowed for: the customer who booked OR the business owner of that appointment.
     */
    @PreAuthorize("@appointmentService.isOwnerOrBusinessOwner(#appointmentId)")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ResponseReviewDTO> getReviewByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(reviewService.getReviewByAppointment(appointmentId));
    }
}
