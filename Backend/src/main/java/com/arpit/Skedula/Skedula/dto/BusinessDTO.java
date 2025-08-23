package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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

    private String businessId;

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
    @Size(min = 12, max = 12, message = "Aadhaar Card Number must be 12 digits")
    @Pattern(regexp = "\\d{12}", message = "Aadhaar Card Number must be numeric")
    private String identity;

    @NotNull(message = "Business CRN Number")
    @Size(min = 21, max = 21, message = "CRN Number must be 14 characters")
    @Pattern(
            regexp = "^[A-Z]{1}\\d{5}[A-Z]{2}\\d{4}[A-Z]{3}\\d{6}$",
            message = "CRN Number must follow the format: U12345MH2025PTC678901"
    )
    private String CRNNumber;

    @NotNull(message = "Registered Business GST number")
    @Size(min = 15, max = 15, message = "GST number must be 15 characters")
    @Pattern(
            regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            message = "GST number must follow the format: 22AAAAA0000A1Z5"
    )
    private String GSTNumber;

    @NotNull(message = "Open Time Required")
    private LocalTime openTime;

    @NotNull(message = "Open Time Required")
    private LocalTime closeTime;

    private BusinessStatus status;

    private List<BusinessServiceOfferedDTO> serviceOffered;
    private List<AppointmentDTO> appointments;


}
