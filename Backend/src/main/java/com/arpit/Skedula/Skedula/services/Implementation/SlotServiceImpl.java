package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.SlotDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.services.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final BusinessServiceOfferedRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public List<SlotDTO> getAvailableSlots(Long serviceId, LocalDate date) {
        BusinessServiceOffered service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        Business business = service.getBusiness();
        LocalTime openTime = business.getOpenTime() != null ? business.getOpenTime() : LocalTime.of(9, 0);
        LocalTime closeTime = business.getCloseTime() != null ? business.getCloseTime() : LocalTime.of(18, 0);
        long durationMinutes = (service.getDuration() != null && service.getDuration() > 0) ? service.getDuration() : 60L;

        // Fetch appointments on this date for the service
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Appointment> existingAppts = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(
                business.getId(), startOfDay, endOfDay
        );

        List<SlotDTO> slots = new ArrayList<>();
        LocalTime current = openTime;
        long stepMinutes = durationMinutes <= 30 ? 30 : (durationMinutes <= 45 ? 45 : 60);

        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        while (!current.plusMinutes(durationMinutes).isAfter(closeTime)) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(durationMinutes);

            boolean isPast = date.isBefore(today) || (date.isEqual(today) && slotStart.isBefore(nowTime.plusMinutes(10)));
            boolean hasOverlap = false;

            for (Appointment appt : existingAppts) {
                if (appt.getAppointmentStatus() == AppointmentStatus.BOOKED || appt.getAppointmentStatus() == AppointmentStatus.PENDING) {
                    LocalTime apptStart = appt.getAppointmentDateTime().toLocalTime();
                    long apptDuration = (appt.getServiceOffered() != null && appt.getServiceOffered().getDuration() != null)
                            ? appt.getServiceOffered().getDuration() : 60L;
                    LocalTime apptEnd = apptStart.plusMinutes(apptDuration);

                    // Check interval overlap: [slotStart, slotEnd) overlaps with [apptStart, apptEnd)
                    if (slotStart.isBefore(apptEnd) && apptStart.isBefore(slotEnd)) {
                        hasOverlap = true;
                        break;
                    }
                }
            }

            if (isPast) {
                slots.add(new SlotDTO(slotStart, false, "Past slot"));
            } else if (hasOverlap) {
                slots.add(new SlotDTO(slotStart, false, "Booked"));
            } else {
                slots.add(new SlotDTO(slotStart, true, "Available"));
            }

            current = current.plusMinutes(stepMinutes);
        }

        return slots;
    }
}
