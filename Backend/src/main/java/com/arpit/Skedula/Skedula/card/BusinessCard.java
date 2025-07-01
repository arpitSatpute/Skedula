package com.arpit.Skedula.Skedula.card;

import lombok.*;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BusinessCard {

    private Long id;

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

    private Date openTime;
    private Date closeTime;

}
