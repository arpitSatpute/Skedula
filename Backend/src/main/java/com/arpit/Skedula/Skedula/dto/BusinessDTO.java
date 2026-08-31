package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Data
@Getter
@Setter
public class BusinessDTO {

    private Long id;

    private String businessId;

    private Long owner;

    @NotBlank(message = "Business name cannot be blank")
    @Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    private String name;

    private String category;

    @NotBlank(message = "Description cannot be blank")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits and may start with '+'")
    private String phone;

    @NotBlank(message = "Address cannot be blank")
    private String address;

    @NotBlank(message = "City cannot be blank")
    private String city;

    @NotBlank(message = "State cannot be blank")
    private String state;

    @NotBlank(message = "Country cannot be blank")
    private String country;

    @NotBlank(message = "Zip code cannot be blank")
    @Pattern(regexp = "^[0-9]{5,6}$", message = "Zip code must be 5 or 6 digits")
    private String zipCode;

    private String mapLink;

    private Double latitude;
    private Double longitude;

    private Integer cancellationCutoffMinutes;
    private Double cancellationFeePercentage;

    @NotBlank(message = "Identity cannot be blank")
    private String identity;

    @NotBlank(message = "CRN Number cannot be blank")
    private String CRNNumber;

    @NotBlank(message = "GST Number cannot be blank")
    private String GSTNumber;

    @NotNull(message = "Opening time cannot be null")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime openTime;

    @NotNull(message = "Closing time cannot be null")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime closeTime;

    private BusinessStatus status;
}
