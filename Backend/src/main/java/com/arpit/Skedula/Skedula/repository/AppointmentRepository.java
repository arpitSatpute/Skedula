package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.Customer;
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

    List<Appointment> findByBusinessAndAppointmentStatus(Business business, AppointmentStatus appointmentStatus);

    List<Appointment> findByBookedBy(Customer customer);

    List<Appointment> findByBusiness_Id(Long businessId);

    List<Appointment> findByBusiness_IdAndServiceOffered_Id(Long businessId, Long serviceId);

    List<Appointment> findByBusiness_IdAndAppointmentDateIsGreaterThanEqual(Long businessId, LocalDate appointmentDateIsGreaterThan);

    List<Appointment> findByBusiness_IdAndAppointmentDateBefore(Long businessId, LocalDate appointmentDateBefore);

    List<Appointment> findByBusiness_IdAndAppointmentDate(Long businessId, LocalDate date);

    boolean existsByAppointmentId(String appointmentId);

    List<Appointment> findByServiceOffered_Id(Long id);
}