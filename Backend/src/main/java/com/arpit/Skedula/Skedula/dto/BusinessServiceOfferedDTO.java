package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.Business;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;


@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusinessServiceOfferedDTO {

    private Long id;

    private String serviceOfferedId;

    @NotNull(message = "Enter Service Name")
    private String name;

    @NotNull(message = "Enter Service Description")
    @Size(min = 10, max = 100)
    private String description;
    @NotNull(message =" Enter Approx Service Duration")
    @Min(value = 1, message = "Duration must be greater than 1 minute")
    private Integer duration;

    @NotNull(message =" Enter Service Price")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message =" Enter Approx Service Duration")
    @Min(value = 1, message = "Required at least 1 slot")
    private Long totalSlots;

    //Business ID
    private Long business;

}
