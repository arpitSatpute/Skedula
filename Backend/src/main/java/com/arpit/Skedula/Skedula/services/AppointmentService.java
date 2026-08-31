package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.CancellationPreviewDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface AppointmentService {

    AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO);

    AppointmentDTO approveAppointment(Long id);

    AppointmentDTO rescheduleAppointment(Long id, LocalDateTime newDateTime);

    CancellationPreviewDTO getCancellationPreview(Long id);

    List<AppointmentCard> getPendingAppointmentRequest(Long businessId);

    AppointmentCard getAppointmentById(Long id);

    AppointmentDTO cancelAppointmentByCustomer(Long id);

    AppointmentDTO cancelAppointmentByOwner(Long id);

    List<AppointmentCard> getAppointmentByCustomerId(Long customerId);

    AppointmentDTO rejectAppointment(Long id);

    AppointmentDTO doneAppointment(Long id);

    List<AppointmentCard> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId);

    List<AppointmentCard> getAllAppointmentsByBusinessId(Long businessId);

    AppointmentDTO convertToDTO(Appointment newAppointment);

    List<AppointmentCard> getAppointmentsOnAndAfterDate(Long businessId);

    List<AppointmentCard> getAppointmentsBeforeDate(Long businessId);

    List<AppointmentCard> getAppointmentBydate(LocalDateTime dateTime, Long businessId);

    Void cancelBooking(Long id);

    void cancelAllAppointmentsByBusinessId(Long id);

    void cancelAllAppointmentsByServiceOfferedId(Long id);

    /**
     * Returns true if the currently authenticated user is either:
     * (a) the customer who booked this appointment, or
     * (b) the owner of the business that this appointment belongs to.
     * Used as a SpEL expression in @PreAuthorize.
     */
    boolean isOwnerOrBusinessOwner(Long appointmentId);
}
