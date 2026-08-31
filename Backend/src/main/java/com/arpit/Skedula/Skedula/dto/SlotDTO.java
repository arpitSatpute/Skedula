package com.arpit.Skedula.Skedula.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SlotDTO {
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime time;
    private boolean available;
    private String reason;
}
