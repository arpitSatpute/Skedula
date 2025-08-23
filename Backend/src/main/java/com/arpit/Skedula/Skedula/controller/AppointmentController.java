package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import okhttp3.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(path = "/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Make Appointment

    @PostMapping("/create")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointmentDTO));
    }

    // Get By id
//    @PreAuthorize("@customerService.isOwnerOfAppointment(#id) || @businessService.isOwnerOfAppointment(#id)")
    @GetMapping("/get/{id}")
    public ResponseEntity<AppointmentCard> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // Cancel Appointment By Customer
//    @PreAuthorize("@customerService.isOwnerOfProfile(#id)")
    @PatchMapping("/cancel/customer/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByCustomer(id));
    }

    // Cancel Appointment By Owner
//    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @PutMapping("/cancel/business/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByOwner(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByOwner(id));
    }

//     Get Booked Appointment By Status By Role By UserId
//    @PreAuthorize("@businessService.isOwnerOfProfile(#userId) || @customerService.isOwnerOfProfile(#userId)")
//    @GetMapping("/get/{status}/{role}/{userId}")
//    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByStatusRoleUserId(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId) {
//        if(status == null || role == null || userId == null) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserId(status, role, userId));
//    }
//
////     Get Booked Appointment By Status By Role By UserId By ServiceId
//    @GetMapping("/get/{status}/{role}/{userId}/{serviceId}")
//    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByService(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId, @PathVariable Long serviceId) {
//        if(status == null || role == null || userId == null) {
//            return ResponseEntity.badRequest().build();
//        }
//        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserIdServiceId(status, role, userId, serviceId));
//    }
//
////     Get Booked Appointment By Date By Role By Status
//    @GetMapping("/get/{status}/{role}/{userId}/{date}")
//    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentByDate(@PathVariable AppointmentStatus status, @PathVariable Role role, @PathVariable Long userId, @PathVariable LocalDate date) {
//        if(status == null || role == null || userId == null) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        return ResponseEntity.ok(appointmentService.getAllAppointmentByStatusRoleUserIdDate(status, role, userId, date));
//    }

//    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @PatchMapping("/approve/{id}")
    public ResponseEntity<AppointmentDTO> approveAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

//    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @PatchMapping("/reject/{id}")
    public ResponseEntity<AppointmentDTO> rejectAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

//    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @PatchMapping("/done/{id}")
    public ResponseEntity<AppointmentDTO> doneAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.doneAppointment(id));
    }

//    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @GetMapping("/request/pending/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getPendingAppointmentRequest(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getPendingAppointmentRequest(businessId));
    }


//    @PreAuthorize("@customerService.isOwnerOfProfile(#customerId)")
    @GetMapping("/get/customer/{customerId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(appointmentService.getAppointmentByCustomerId(customerId));
    }


    // Get All Appointments By Business Id and Service Id
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @GetMapping("get/business/service/{businessId}/{serviceId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByBusinessIdAndServiceId(@PathVariable Long businessId, @PathVariable Long serviceId) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByBusinessIdAndServiceId(businessId, serviceId));
    }

    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @GetMapping("get/business/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByBusinessId(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByBusinessId(businessId));
    }


    @GetMapping("/get/upcoming/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsOnAndAfterDate(@PathVariable Long businessId) {
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsOnAndAfterDate(businessId));
    }


    @GetMapping("/get/previous/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsBeforeDate(@PathVariable Long businessId) {
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsBeforeDate(businessId));
    }

    @GetMapping("/get/date/{dateTime}/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsByDate(@PathVariable LocalDateTime dateTime, @PathVariable Long businessId) {
        if (dateTime == null || businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentBydate(dateTime, businessId));
    }

    @PatchMapping("/cancelBooking/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelBooking(id));
    }

//    @GetMapping("/get/customer/{customerId")
//    public ResponseEntity<List<AppointmentDTO>> getAppointmentByCustomerId(@PathVariable Long customerId) {
//        return ResponseEntity.ok(appointmentService.getAppointmentByCustomerId(customerId));
//    }

}
