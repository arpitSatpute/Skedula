package com.arpit.Skedula.Skedula.card;

import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AppointmentCard {

    private Long id;
    private String appointmentId;
    private LocalDateTime dateTime;
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
