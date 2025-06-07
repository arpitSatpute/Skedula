package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Long countByServiceOffered_IdAndAppointmentDateAndAppointmentStatus(Long serviceOffered, LocalDate date, AppointmentStatus appointmentStatus);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_Id(AppointmentStatus status, Role role, Long bookedById);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_Id(AppointmentStatus status, Role role, Long businessId);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndAppointmentDate(AppointmentStatus status, Role role, Long userId, LocalDate date);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndAppointmentDate(AppointmentStatus status, Role role, Long userId, LocalDate date);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndServiceOffered_Id(AppointmentStatus status, Role role, Long userId, Long serviceId);

    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndServiceOffered_Id(AppointmentStatus status, Role role, Long userId, Long serviceId);
}