package com.arpit.Skedula.Skedula.entity;

import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
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
    private String serviceOfferedId;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String imageUrl;

    private Long totalSlots;


    @ManyToOne
    private Business business;

    private ServiceStatus status;

    // Add any other fields related to the service here
}
