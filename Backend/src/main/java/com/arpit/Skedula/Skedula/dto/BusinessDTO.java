package com.arpit.Skedula.Skedula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.Length;

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

    @NotNull
    private String name;

    @NotNull(message = "Service description cannot be null")
    @Size(min = 50, max = 5000, message = "Service description must be between 50 and 5000 characters")
    private String description;

    @NotNull(message = "Enter Business Email")
    private String email;

    @NotNull(message = "Enter Business Phone Number")
    private String phone;

    @NotNull(message = "Required Address")
    private String address;
    @NotNull(message = "Required City")
    private String city;
    @NotNull(message = "Required State")
    private String state;
    @NotNull(message = "Required Country")
    private String country;
    @NotNull(message = "Required Zip Code")
    private String zipCode;

    // Share Link of Google Map
    @NotNull(message = "Required Google Maps Link")
    private String mapLink;

    @NotNull(message = "Required Aadhaar Card Number")
    private String identity;

    @NotNull(message = "Business CRN Number")
    private String CRNNumber;

    @NotNull(message = "Registered Business GST number")
    private String GSTNumber;

    @NotNull(message = "Open Time Required")
    private LocalTime openTime;

    @NotNull(message = "Open Time Required")
    private LocalTime closeTime;

    private List<BusinessServiceOfferedDTO> serviceOffered;
    private List<AppointmentDTO> appointments;


}
