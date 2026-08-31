package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private BusinessServiceOffered service;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", unique = true, nullable = false)
    private Appointment appointment;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(length = 1000)
    private String comment;

    @CurrentTimestamp
    private LocalDateTime createdAt;
}
