package com.arpit.Skedula.Skedula.dto;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusinessDTO {

    private Long id;

    private Long owner;
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

    private List<BusinessServiceOfferedDTO> serviceOffered;
    private List<AppointmentDTO> appointments;


}
