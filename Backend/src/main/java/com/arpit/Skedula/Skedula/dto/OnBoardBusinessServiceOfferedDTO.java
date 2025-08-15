package com.arpit.Skedula.Skedula.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OnBoardBusinessServiceOfferedDTO {

    @NotNull(message = "Service name Cannot be null")
    private String name;

    @NotNull(message = "Service description cannot be null")
    @Size(min = 50, max = 5000, message = "Service description must be between 50 and 5000 characters")
    private String description;

    @NotNull(message = "Service duration cannot be null")
    @Min(value = 5, message = "Service duration must be at least 5 minutes")
    private Integer duration;

    @NotNull(message = "Service price cannot be null")
    private BigDecimal price;


    @NotNull(message = "Total slots cannot be null")
    private Long totalSlots;

    //Business ID
    private Long business;


}
