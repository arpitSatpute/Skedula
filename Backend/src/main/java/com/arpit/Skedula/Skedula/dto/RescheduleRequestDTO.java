package com.arpit.Skedula.Skedula.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RescheduleRequestDTO {
    private LocalDateTime newDateTime;
}
