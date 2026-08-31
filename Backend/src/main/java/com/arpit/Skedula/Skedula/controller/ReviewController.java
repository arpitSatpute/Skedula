package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessReviewSummaryDTO;
import com.arpit.Skedula.Skedula.dto.RequestReviewDTO;
import com.arpit.Skedula.Skedula.dto.ResponseReviewDTO;
import com.arpit.Skedula.Skedula.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/create")
    public ResponseEntity<ResponseReviewDTO> createReview(@RequestBody RequestReviewDTO request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ResponseReviewDTO> getReviewByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(reviewService.getReviewByAppointment(appointmentId));
    }
}
