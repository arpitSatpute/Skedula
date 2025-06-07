package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(path = "/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;



    // Make Appointment
    @PostMapping("/create")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointmentDTO));
    }

    // Get By id
    @GetMapping("/get/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // Cancel Appointment By Customer
    @PutMapping("/cancel/customer/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByCustomer(id));
    }

    // Cancel Appointment By Owner
    @PutMapping("/cancel/business/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByOwner(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByOwner(id));
    }

    // Get Booked Appointment By Status By Role By UserId
    @GetMapping("/get/{status}/{role}/{userId}")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByStatusRoleUserId(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId) {
        if(status == null || role == null || userId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserId(status, role, userId));
    }


    // Get Booked Appointment By Status By Role By UserId By ServiceId
    @GetMapping("/get/{status}/{role}/{userId}/{serviceId}")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByService(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId, @PathVariable Long serviceId) {
        if(status == null || role == null || userId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserIdServiceId(status, role, userId, serviceId));
    }


    // Get Booked Appointment By Date By Role By Status
    @GetMapping("/get/{status}/{role}/{userId}/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByDate(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId, @PathVariable LocalDate date) {
        if(status == null || role == null || userId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserIdDate(status, role, userId, date));
    }

}
