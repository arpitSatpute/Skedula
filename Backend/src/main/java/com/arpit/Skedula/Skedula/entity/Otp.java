package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Otp {

    @Id
    private String key; // e.g., user identifier (email, phone number)

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private long expirationTime; // Timestamp for OTP expiration


}
