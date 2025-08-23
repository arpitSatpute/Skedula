package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public interface AppointmentService {

    AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO);

    AppointmentDTO approveAppointment(Long id);

    List<AppointmentCard> getPendingAppointmentRequest(Long businessId);

    AppointmentCard getAppointmentById(Long id);

    AppointmentDTO cancelAppointmentByCustomer(Long id);

    AppointmentDTO cancelAppointmentByOwner(Long id);
//
//    List<AppointmentDTO> getAllAppointmentByStatusRoleUserId(AppointmentStatus status, Role role, Long userId);
//
//    List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdDate(AppointmentStatus status, Role role, Long userId, LocalDate date);
//
//    List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdServiceId(AppointmentStatus status, Role role, Long userId, Long serviceId);

    List<AppointmentCard> getAppointmentByCustomerId(Long customerId);

    AppointmentDTO rejectAppointment(Long id);

    AppointmentDTO doneAppointment(Long id);

    List<AppointmentCard> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId);

    List<AppointmentCard> getAllAppointmentsByBusinessId(Long businessId);

    AppointmentDTO convertToDTO(Appointment newAppointment);

    List<AppointmentCard> getAppointmentsOnAndAfterDate(Long businessId);

    List<AppointmentCard> getAppointmentsBeforeDate(Long businessId);

    List<AppointmentCard> getAppointmentBydate(LocalDate date, Long businessId);

    Void cancelBooking(Long id);

    void cancelAllAppointmentsByBusinessId(Long id);

    void cancelAllAppointmentsByServiceOfferedId(Long id);

}
