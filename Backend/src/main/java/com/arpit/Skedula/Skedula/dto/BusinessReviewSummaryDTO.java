package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BusinessReviewSummaryDTO {
    private Double averageRating;
    private Long totalReviews;
    private List<ResponseReviewDTO> reviews;
}
