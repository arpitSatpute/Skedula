package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulingServices {

    private final AppointmentRepository appointmentRepository;

    @Scheduled(fixedRate = 30000)
    private void pingBackend() {
        System.out.println("Pinging backend to keep it awake...");
    }

    @Scheduled(cron = "1 0 0 * * ?") // Runs daily at midnight
    private void cancelPendingAppointments() {
        List<Appointment> appointments = appointmentRepository.findAllByAppointmentDateBeforeAndAppointmentStatus(
                LocalDate.now(),
                AppointmentStatus.PENDING
        );
        if(appointments.isEmpty()){
            return;
        }
        for (Appointment appointment : appointments) {
            appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        }

    }
}
