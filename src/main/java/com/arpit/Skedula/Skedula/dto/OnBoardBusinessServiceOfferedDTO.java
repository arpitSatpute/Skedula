package com.arpit.Skedula.Skedula.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OnBoardBusinessServiceOfferedDTO {

    private String name;
    private String description;
    private Integer duration;
    private BigDecimal price;
    private String imageUrl;

    private Long totalSlots;

    //Business ID
    private Long business;


}
