package com.arpit.Skedula.Skedula.dto;

import lombok.Data;

@Data
public class RequestReviewDTO {
    private Long appointmentId;
    private Integer rating; // 1 to 5
    private String comment;
}
