package com.arpit.Skedula.Skedula.card;

import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

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
    private List<String> imageUrls;
    private Long totalSlots;
    private ServiceStatus status;

    private Long businessId;
    private String businessName;
    private String category;
}
