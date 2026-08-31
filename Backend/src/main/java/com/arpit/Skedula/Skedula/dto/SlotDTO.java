package com.arpit.Skedula.Skedula.dto;

import lombok.*;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SlotDTO {
    private LocalTime time;
    private boolean available;
    private String reason;
}
