package com.arpit.Skedula.Skedula.card;

import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AppointmentCard {

    private Long id;
    private String appointmentId;
    private LocalDate date;
    private AppointmentStatus appointmentStatus;
    private String notes;
    // BusinessServiceOffered ID
    private Long serviceOffered;
    private String serviceOfferedId;
    // Customer ID
    private Long bookedBy;
    private String customerId;
    // Business Id
    private Long businessId;
    private String bid;

}
