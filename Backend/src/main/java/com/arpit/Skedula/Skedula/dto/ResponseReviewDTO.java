package com.arpit.Skedula.Skedula.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResponseReviewDTO {
    private Long id;
    private String customerName;
    private String serviceName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
