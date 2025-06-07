package com.arpit.Skedula.Skedula.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BusinessServiceOffered {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String imageUrl;

    private Long totalSlots;


    @ManyToOne
    private Business business;

    // Add any other fields related to the service here
}
