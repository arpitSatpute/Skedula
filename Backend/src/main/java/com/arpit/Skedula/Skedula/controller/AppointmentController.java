package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.CancellationPreviewDTO;
import com.arpit.Skedula.Skedula.dto.RescheduleRequestDTO;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/get/{id}")
    public ResponseEntity<AppointmentCard> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // Cancellation Preview (Calculates server-side policy and refund amount)
    @GetMapping("/cancellation-preview/{id}")
    public ResponseEntity<CancellationPreviewDTO> getCancellationPreview(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getCancellationPreview(id));
    }

    // Reschedule Slot (Shifts date/time without re-payment)
    @PatchMapping("/reschedule/{id}")
    public ResponseEntity<AppointmentDTO> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequestDTO rescheduleRequest) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, rescheduleRequest.getNewDateTime()));
    }

    // Cancel Appointment By Customer
    @PatchMapping("/cancel/customer/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByCustomer(id));
    }

    // Cancel Appointment By Owner
    @PutMapping("/cancel/business/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByOwner(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByOwner(id));
    }

    @PatchMapping("/approve/{id}")
    public ResponseEntity<AppointmentDTO> approveAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    @PatchMapping("/reject/{id}")
    public ResponseEntity<AppointmentDTO> rejectAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

    @PatchMapping("/done/{id}")
    public ResponseEntity<AppointmentDTO> doneAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.doneAppointment(id));
    }

    @GetMapping("/request/pending/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getPendingAppointmentRequest(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getPendingAppointmentRequest(businessId));
    }

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
}
