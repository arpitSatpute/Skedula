package com.arpit.Skedula.Skedula.card;

import com.arpit.Skedula.Skedula.entity.enums.BusinessStatus;
import lombok.*;

import java.time.LocalTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusinessCard {

    private Long id;

    private String businessId;

    private String name;

    private String category;

    private String description;

    private String address;

    private String city;

    private String state;

    private String country;

    private String phone;

    private String email;

    private String zipCode;

    private String mapLink;

    private Double latitude;
    private Double longitude;
    private Double distanceKm; // Calculated distance relative to requesting user coordinates

    private Integer cancellationCutoffMinutes;
    private Double cancellationFeePercentage;

    private Double averageRating;
    private Long totalReviews;

    private LocalTime openTime;

    private LocalTime closeTime;

    private BusinessStatus status;
}
