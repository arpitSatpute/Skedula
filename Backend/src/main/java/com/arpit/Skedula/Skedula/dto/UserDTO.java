package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class UserDTO {

    private Long id;

    @NotEmpty(message = "Name cannot be empty")
    private String name;

    @Email(message = "Invalid email format")
    @NotEmpty(message = "Email cannot be empty")
    private String email;

    @NotBlank
    @Size(min = 10, max = 10, message = "Phone number must be 10 digits")
    private String phone;

    private String imageUrl;

    @NotNull(message = "Role cannot be null")
    private Set<Role> roles;

}
