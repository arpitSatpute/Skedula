package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_Id(AppointmentStatus status, Role role, Long bookedById);
//
//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_Id(AppointmentStatus status, Role role, Long businessId);
//
//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndAppointmentDateTime(AppointmentStatus status, Role role, Long userId, LocalDateTime date);
//
//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndAppointmentDateTime(AppointmentStatus status, Role role, Long userId, LocalDateTime date);
//
//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndServiceOffered_Id(AppointmentStatus status, Role role, Long userId, Long serviceId);
//
//    List<Appointment> getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndServiceOffered_Id(AppointmentStatus status, Role role, Long userId, Long serviceId);

    Long countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(Long serviceOffered, LocalDateTime start, LocalDateTime end, AppointmentStatus appointmentStatus);

    List<Appointment> findByBusinessAndAppointmentStatus(Business business, AppointmentStatus appointmentStatus);

    List<Appointment> findByBookedBy(Customer customer);

    List<Appointment> findByBusiness_Id(Long businessId);

    List<Appointment> findByBusiness_IdAndServiceOffered_Id(Long businessId, Long serviceId);

    List<Appointment> findByBusiness_IdAndAppointmentDateTimeIsGreaterThanEqual(Long businessId, LocalDate AppointmentDateTimeIsGreaterThan);

    List<Appointment> findByBusiness_IdAndAppointmentDateTimeBefore(Long businessId, LocalDate AppointmentDateTimeBefore);

    List<Appointment> findByBusiness_IdAndAppointmentDateTime(Long businessId, LocalDate date);

    boolean existsByAppointmentId(String appointmentId);

    List<Appointment> findByServiceOffered_Id(Long id);

    List<Appointment> findAllByAppointmentDateTimeBeforeAndAppointmentStatus(LocalDate AppointmentDateTimeBefore, AppointmentStatus appointmentStatus);

    boolean existsByServiceOffered_IdAndAppointmentDateTimeAndAppointmentStatus(Long serviceOffered, @NotNull(message = "Appointment Date cannot be null") LocalDateTime dateTime, AppointmentStatus appointmentStatus);

}