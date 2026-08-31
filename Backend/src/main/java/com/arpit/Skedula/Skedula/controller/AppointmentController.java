package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.CancellationPreviewDTO;
import com.arpit.Skedula.Skedula.dto.RescheduleRequestDTO;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(path = "/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Book an appointment.
     * Only the customer who owns the given customerId can book on their own behalf.
     */
    @PreAuthorize("#appointmentDTO.bookedBy == null || @customerService.isOwnerOfProfile(#appointmentDTO.bookedBy)")
    @Secured("ROLE_CUSTOMER")
    @PostMapping("/create")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointmentDTO));
    }

    /**
     * Get appointment by ID.
     * Allowed for: the customer who booked it, the business owner, or an admin.
     */
    @PreAuthorize("@appointmentService.isOwnerOrBusinessOwner(#id)")
    @GetMapping("/get/{id}")
    public ResponseEntity<AppointmentCard> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    /**
     * Get cancellation preview.
     * Allowed for: the customer who booked or the business owner.
     */
    @PreAuthorize("@appointmentService.isOwnerOrBusinessOwner(#id)")
    @GetMapping("/cancellation-preview/{id}")
    public ResponseEntity<CancellationPreviewDTO> getCancellationPreview(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getCancellationPreview(id));
    }

    /**
     * Reschedule an appointment.
     * Only the customer who booked it can reschedule.
     */
    @PreAuthorize("@customerService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_CUSTOMER")
    @PatchMapping("/reschedule/{id}")
    public ResponseEntity<AppointmentDTO> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequestDTO rescheduleRequest) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, rescheduleRequest.getNewDateTime()));
    }

    /**
     * Customer cancels their own appointment.
     */
    @PreAuthorize("@customerService.isOwnerOfAppointment(#id)")
    @PatchMapping({"/cancel/customer/{id}", "/cancelBooking/{id}"})
    public ResponseEntity<AppointmentDTO> cancelAppointmentByCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByCustomer(id));
    }

    /**
     * Business owner cancels an appointment at their business.
     */
    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_OWNER")
    @PutMapping("/cancel/business/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointmentByOwner(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByOwner(id));
    }

    /**
     * Business owner approves a pending appointment.
     */
    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_OWNER")
    @PatchMapping("/approve/{id}")
    public ResponseEntity<AppointmentDTO> approveAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    /**
     * Business owner rejects a pending appointment.
     */
    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_OWNER")
    @PatchMapping("/reject/{id}")
    public ResponseEntity<AppointmentDTO> rejectAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

    /**
     * Business owner marks an appointment as done.
     */
    @PreAuthorize("@businessService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_OWNER")
    @PatchMapping("/done/{id}")
    public ResponseEntity<AppointmentDTO> doneAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.doneAppointment(id));
    }

    /**
     * Get pending appointment requests for a business.
     * Only the business owner can see their own pending requests.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("/request/pending/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getPendingAppointmentRequest(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getPendingAppointmentRequest(businessId));
    }

    /**
     * Get all appointments for a specific customer.
     * Only the customer themselves can see their own appointment list.
     */
    @PreAuthorize("@customerService.isOwnerOfProfile(#customerId)")
    @Secured("ROLE_CUSTOMER")
    @GetMapping("/get/customer/{customerId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(appointmentService.getAppointmentByCustomerId(customerId));
    }

    /**
     * Get all appointments for a business and specific service.
     * Only the business owner can query this.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("get/business/service/{businessId}/{serviceId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByBusinessIdAndServiceId(
            @PathVariable Long businessId, @PathVariable Long serviceId) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByBusinessIdAndServiceId(businessId, serviceId));
    }

    /**
     * Get all appointments for a business.
     * Only the business owner can query this.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("get/business/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAllAppointmentsByBusinessId(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getAllAppointmentsByBusinessId(businessId));
    }

    /**
     * Get upcoming appointments for a business.
     * Only the business owner can query this.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("/get/upcoming/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsOnAndAfterDate(@PathVariable Long businessId) {
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsOnAndAfterDate(businessId));
    }

    /**
     * Get past appointments for a business.
     * Only the business owner can query this.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("/get/previous/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsBeforeDate(@PathVariable Long businessId) {
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsBeforeDate(businessId));
    }

    /**
     * Get appointments for a business on a specific date.
     * Only the business owner can query this.
     */
    @PreAuthorize("@businessService.isOwnerOfProfile(#businessId)")
    @Secured("ROLE_OWNER")
    @GetMapping("/get/date/{dateTime}/{businessId}")
    public ResponseEntity<List<AppointmentCard>> getAppointmentsByDate(
            @PathVariable LocalDateTime dateTime, @PathVariable Long businessId) {
        if (dateTime == null || businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentService.getAppointmentBydate(dateTime, businessId));
    }

    /**
     * Cancel a booking (customer-initiated).
     * Only the customer who booked can cancel via this endpoint.
     */
    @PreAuthorize("@customerService.isOwnerOfAppointment(#id)")
    @Secured("ROLE_CUSTOMER")
    @PatchMapping("/cancelBooking/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelBooking(id));
    }
}
