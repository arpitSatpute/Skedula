package com.arpit.Skedula.Skedula.entity;

import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus appointmentStatus;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private BusinessServiceOffered serviceOffered;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Customer bookedBy;

    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;



    // Add any other fields related to the appointment here

}
