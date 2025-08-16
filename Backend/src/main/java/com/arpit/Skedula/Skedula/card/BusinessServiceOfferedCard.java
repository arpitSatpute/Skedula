package com.arpit.Skedula.Skedula.card;


import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BusinessServiceOfferedCard {
    private Long id;
    private String serviceOfferedId;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String imageUrl;
    private Long totalSlots;
}
