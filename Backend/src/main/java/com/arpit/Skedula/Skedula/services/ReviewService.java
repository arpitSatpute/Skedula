package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.BusinessReviewSummaryDTO;
import com.arpit.Skedula.Skedula.dto.RequestReviewDTO;
import com.arpit.Skedula.Skedula.dto.ResponseReviewDTO;

public interface ReviewService {
    ResponseReviewDTO createReview(RequestReviewDTO request);
    BusinessReviewSummaryDTO getReviewsByBusiness(Long businessId);
    ResponseReviewDTO getReviewByAppointment(Long appointmentId);
}
