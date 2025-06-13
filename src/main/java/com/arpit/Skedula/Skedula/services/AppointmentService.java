package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public interface AppointmentService {

    AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO);

    AppointmentDTO approveAppointment(Long id);

    List<AppointmentDTO> getPendingAppointmentRequest(Long businessId);

    AppointmentDTO getAppointmentById(Long id);

    AppointmentDTO cancelAppointmentByCustomer(Long id);

    AppointmentDTO cancelAppointmentByOwner(Long id);

    List<AppointmentDTO> getAllAppointmentByStatusRoleUserId(AppointmentStatus status, Role role, Long userId);

    List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdDate(AppointmentStatus status, Role role, Long userId, LocalDate date);

    List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdServiceId(AppointmentStatus status, Role role, Long userId, Long serviceId);

    List<AppointmentDTO> getAppointmentByCustomerId(Long customerId);


    AppointmentDTO rejectAppointment(Long id);

    AppointmentDTO doneAppointment(Long id);
}
