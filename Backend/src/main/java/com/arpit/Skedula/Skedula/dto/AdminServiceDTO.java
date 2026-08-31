package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.ServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminServiceDTO {
    private Long id;
    private String serviceOfferedId;
    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String imageUrl;
    private Long totalSlots;
    private ServiceStatus status;

    private Long businessId;
    private String businessName;
}
