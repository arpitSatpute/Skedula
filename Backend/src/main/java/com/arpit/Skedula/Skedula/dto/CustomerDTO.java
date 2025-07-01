package com.arpit.Skedula.Skedula.dto;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.User;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDTO {

    public Long id;
    public Long user;
    List<Appointment> appointments;

}
