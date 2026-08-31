package com.arpit.Skedula.Skedula.entity;

import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String businessId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    private String name;
    private String description;

    // Service category (e.g. Salons & Hair Styling, Dental Clinics, etc.)
    @Builder.Default
    private String category = "Spa & Wellness";

    private String email;
    private String phone;

    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;

    // Share Link of Google Map
    private String mapLink;

    // Geographic coordinates for distance / near-me filtering
    private Double latitude;
    private Double longitude;

    // Cancellation policy configuration
    @Builder.Default
    private Integer cancellationCutoffMinutes = 120; // Default: 2 hours

    @Builder.Default
    private Double cancellationFeePercentage = 20.0; // Default: 20%

    private String identity;
    private String CRNNumber;

    private String GSTNumber;

    private LocalTime openTime;
    private LocalTime closeTime;

    private BusinessStatus status;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<BusinessServiceOffered> serviceOffered;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Appointment> appointments;

}
