package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

import java.util.Date;

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

    private String ownerIdentity;
    private String CRNNumber;

    private String GSTNumber;

    private LocalTime openTime;
    private LocalTime closeTime;



    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BusinessServiceOffered> serviceOffered;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments;


    // Add any other business-related fields here

}
