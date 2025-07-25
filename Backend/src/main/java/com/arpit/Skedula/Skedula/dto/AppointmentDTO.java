package com.arpit.Skedula.Skedula.dto;


import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;


@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {

    private Long id;

    @NotNull(message = "Appointment Date cannot be null")
    private LocalDate date;


    private AppointmentStatus appointmentStatus;

    @Size(max = 5000, message = "Notes cannot exceed 500 characters")
    private String notes;

    // BusinessServiceOffered ID
    private Long serviceOffered;

    // Customer ID
    private Long bookedBy;

    // Business Id
    private Long businessId;

}
