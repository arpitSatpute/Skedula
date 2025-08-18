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

    private String email;
    private String phone;

    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;

    // Share Link of Google Map
    private String mapLink;

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


    // Add any other business-related fields here

}
