package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Long countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(Long serviceOffered, LocalDateTime start, LocalDateTime end, AppointmentStatus appointmentStatus);

    List<Appointment> findByBusinessAndAppointmentStatus(Business business, AppointmentStatus appointmentStatus);

    List<Appointment> findByBusiness_IdAndAppointmentStatus(Long businessId, AppointmentStatus appointmentStatus);

    List<Appointment> findByBookedBy(Customer customer);

    List<Appointment> findByBookedBy_Id(Long customerId);

    List<Appointment> findByBusiness_Id(Long businessId);

    List<Appointment> findByBusiness_IdAndServiceOffered_Id(Long businessId, Long serviceId);

    List<Appointment> findByBusiness_IdAndAppointmentDateTimeIsGreaterThanEqual(Long businessId, LocalDateTime AppointmentDateTimeIsGreaterThan);

    List<Appointment> findByBusiness_IdAndAppointmentDateTimeBefore(Long businessId, LocalDateTime AppointmentDateTimeBefore);

    List<Appointment> findByBusiness_IdAndAppointmentDateTimeBetween(Long businessId, LocalDateTime appointmentDateTimeAfter, LocalDateTime appointmentDateTimeBefore);

    boolean existsByAppointmentId(String appointmentId);

    List<Appointment> findByServiceOffered_Id(Long id);

    List<Appointment> findAllByAppointmentDateTimeBeforeAndAppointmentStatus(LocalDateTime appointmentDateTime, AppointmentStatus appointmentStatus);

    boolean existsByServiceOffered_IdAndAppointmentDateTimeAndAppointmentStatus(Long serviceOffered, @NotNull(message = "Appointment Date cannot be null") LocalDateTime dateTime, AppointmentStatus appointmentStatus);
}
