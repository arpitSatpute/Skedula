package com.arpit.Skedula.Skedula.dto;


import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;


@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {

    private Long id;
    private LocalDate date;

    private AppointmentStatus appointmentStatus;

    private String notes;

    // BusinessServiceOffered ID
    private Long serviceOffered;

    // Customer ID
    private Long bookedBy;

    // Business Id
    private Long businessId;

}
