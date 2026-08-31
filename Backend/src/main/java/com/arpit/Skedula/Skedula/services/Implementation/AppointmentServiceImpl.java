package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.dto.CancellationPreviewDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.*;
import com.arpit.Skedula.Skedula.services.AppointmentService;
import com.arpit.Skedula.Skedula.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO) {
        LocalDateTime apptDateTime = appointmentDTO.getDateTime().withSecond(0).withNano(0);
        appointmentDTO.setDateTime(apptDateTime);
        if(apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date cannot be in the past.");
        }

        Business business = businessRepository.findById(appointmentDTO.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + appointmentDTO.getBusinessId()));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointmentDTO.getServiceOffered())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if(apptDateTime.toLocalTime().isBefore(business.getOpenTime()) ||
           apptDateTime.toLocalTime().isAfter(business.getCloseTime().minusMinutes(serviceOffered.getDuration()))) {
            throw new RuntimeException("Appointment time must be within business operating hours: " +
                    business.getOpenTime() + " - " + business.getCloseTime().minusMinutes(serviceOffered.getDuration()));
        }

        // Concurrency / Overlap check on this date
        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> dayAppts = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(
                business.getId(), startOfDay, endOfDay
        );

        LocalTime reqStart = apptDateTime.toLocalTime();
        LocalTime reqEnd = reqStart.plusMinutes(serviceOffered.getDuration());

        for (Appointment existing : dayAppts) {
            if (existing.getAppointmentStatus() == AppointmentStatus.BOOKED || existing.getAppointmentStatus() == AppointmentStatus.PENDING) {
                LocalTime exStart = existing.getAppointmentDateTime().toLocalTime();
                long exDur = existing.getServiceOffered() != null && existing.getServiceOffered().getDuration() != null
                        ? existing.getServiceOffered().getDuration() : 60L;
                LocalTime exEnd = exStart.plusMinutes(exDur);

                if (reqStart.isBefore(exEnd) && exStart.isBefore(reqEnd)) {
                    throw new RuntimeException("Requested slot conflicts with an existing booking. Please choose another time or date.");
                }
            }
        }

        Long total = serviceOffered.getTotalSlots();
        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(
                appointmentDTO.getServiceOffered(),
                startOfDay,
                endOfDay,
                AppointmentStatus.BOOKED
        );

        Customer customer = customerRepository.findById(appointmentDTO.getBookedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointmentDTO.getBookedBy()));
        Wallet customerWallet = walletRepository.findByUser_Id(customer.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found with id: " + customer.getUser().getId()));

        if(customerWallet.getBalance().compareTo(serviceOffered.getPrice()) < 0) {
            throw new RuntimeException("Insufficient balance in wallet to book the appointment.");
        }
        if(booked >= total) {
            throw new RuntimeException("No slots available for the selected service on the given date.");
        }

        appointmentDTO.setAppointmentId(generateAppointmentId());
        Appointment newAppointment = convertToEntity(appointmentDTO, serviceOffered, customer);
        newAppointment.setAppointmentStatus(AppointmentStatus.PENDING);

        appointmentRepository.save(newAppointment);
        return convertToDTO(newAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, LocalDateTime newDateTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (appointment.getAppointmentStatus() != AppointmentStatus.BOOKED && appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only Booked or Pending appointments can be rescheduled.");
        }

        LocalDateTime apptDateTime = newDateTime.withSecond(0).withNano(0);
        if (apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Rescheduled date & time cannot be in the past.");
        }

        Business business = appointment.getBusiness();
        BusinessServiceOffered serviceOffered = appointment.getServiceOffered();

        if (apptDateTime.toLocalTime().isBefore(business.getOpenTime()) ||
            apptDateTime.toLocalTime().isAfter(business.getCloseTime().minusMinutes(serviceOffered.getDuration()))) {
            throw new RuntimeException("Rescheduled time must be within business operating hours: " +
                    business.getOpenTime() + " - " + business.getCloseTime().minusMinutes(serviceOffered.getDuration()));
        }

        // Conflict check for new slot
        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> dayAppts = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(
                business.getId(), startOfDay, endOfDay
        );

        LocalTime reqStart = apptDateTime.toLocalTime();
        LocalTime reqEnd = reqStart.plusMinutes(serviceOffered.getDuration());

        for (Appointment existing : dayAppts) {
            if (!existing.getId().equals(appointment.getId()) &&
                (existing.getAppointmentStatus() == AppointmentStatus.BOOKED || existing.getAppointmentStatus() == AppointmentStatus.PENDING)) {
                LocalTime exStart = existing.getAppointmentDateTime().toLocalTime();
                long exDur = existing.getServiceOffered() != null && existing.getServiceOffered().getDuration() != null
                        ? existing.getServiceOffered().getDuration() : 60L;
                LocalTime exEnd = exStart.plusMinutes(exDur);

                if (reqStart.isBefore(exEnd) && exStart.isBefore(reqEnd)) {
                    throw new RuntimeException("The selected slot conflicts with another booking. Please select another slot.");
                }
            }
        }

        appointment.setAppointmentDateTime(apptDateTime);
        appointment.setRescheduledAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    @Override
    public CancellationPreviewDTO getCancellationPreview(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        BigDecimal total = appointment.getServiceOffered() != null ? appointment.getServiceOffered().getPrice() : BigDecimal.ZERO;
        Business business = appointment.getBusiness();
        int cutoff = business.getCancellationCutoffMinutes() != null ? business.getCancellationCutoffMinutes() : 120;
        double feePct = business.getCancellationFeePercentage() != null ? business.getCancellationFeePercentage() : 20.0;

        long minutesRemaining = Duration.between(LocalDateTime.now(), appointment.getAppointmentDateTime()).toMinutes();
        boolean isLate = minutesRemaining < cutoff;

        BigDecimal fee = BigDecimal.ZERO;
        BigDecimal refund = total;

        if (isLate) {
            fee = total.multiply(BigDecimal.valueOf(feePct / 100.0)).setScale(2, RoundingMode.HALF_UP);
            refund = total.subtract(fee).max(BigDecimal.ZERO);
        }

        return CancellationPreviewDTO.builder()
                .isLateCancellation(isLate)
                .totalAmount(total)
                .cancellationFee(fee)
                .refundAmount(refund)
                .cutoffMinutes(cutoff)
                .feePercentage(feePct)
                .minutesRemaining(minutesRemaining)
                .build();
    }

    @Override
    public AppointmentDTO approveAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        LocalDateTime apptDateTime = appointment.getAppointmentDateTime().withSecond(0).withNano(0);
        if(apptDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot approve appointment for past date.");
        }

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered().getId()));

        LocalDateTime startOfDay = apptDateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = apptDateTime.toLocalDate().atTime(23, 59, 59);

        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateTimeBetweenAndAppointmentStatus(
                appointment.getServiceOffered().getId(),
                startOfDay,
                endOfDay,
                AppointmentStatus.BOOKED
        );

        if(booked >= serviceOffered.getTotalSlots()) {
            throw new RuntimeException("No slots available for the selected service on the given date.");
        }

        appointment.setAppointmentStatus(AppointmentStatus.BOOKED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        paymentService.createNewPayment(savedAppointment);
        paymentService.processPayment(savedAppointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        appointment.setAppointmentStatus(AppointmentStatus.REJECTED);
        appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO doneAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if(appointment.getAppointmentStatus() != AppointmentStatus.BOOKED) {
            throw new RuntimeException("Only booked appointments can be marked as done.");
        }
        appointment.setAppointmentStatus(AppointmentStatus.DONE);
        appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }

    @Override
    public List<AppointmentCard> getPendingAppointmentRequest(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointmentList = appointmentRepository.findByBusiness_IdAndAppointmentStatus(businessId, AppointmentStatus.PENDING);
        return appointmentList.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentCard getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return convertToCard(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByCustomer(Long id){
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        cancelBooking(id);
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByOwner(Long id){
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        paymentService.refundPayment(appointment);
        return convertToDTO(appointment);
    }

    @Override
    public List<AppointmentCard> getAppointmentByCustomerId(Long customerId) {
        List<Appointment> appointmentList = appointmentRepository.findByBookedBy_Id(customerId);
        return appointmentList.stream()
                .map(this::convertToCard)
                .toList();
    }

    @Override
    public List<AppointmentCard> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId) {
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndServiceOffered_Id(businessId, serviceId);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAllAppointmentsByBusinessId(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(businessId);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentsOnAndAfterDate(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeIsGreaterThanEqual(businessId, LocalDateTime.now());
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentsBeforeDate(Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBefore(businessId, LocalDateTime.now());
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentBydate(LocalDateTime dateTime, Long businessId) {
        businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        LocalDateTime startOfDay = dateTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = dateTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateTimeBetween(businessId, startOfDay, endOfDay);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Void cancelBooking(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if(appointment.getAppointmentStatus() != AppointmentStatus.BOOKED && appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only active booked or pending appointments can be cancelled.");
        }

        CancellationPreviewDTO preview = getCancellationPreview(id);

        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // If it was already BOOKED, payment was processed, so refund according to server-calculated policy
        paymentService.refundBookedAppointmentPayment(appointment, preview.getRefundAmount());

        return null;
    }

    @Override
    @Transactional
    public void cancelAllAppointmentsByBusinessId(Long id) {
        businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(id);
        List<Appointment> bookedAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());
        for(Appointment appointment : bookedAppointments){
            cancelAppointmentByOwner(appointment.getId());
        }

        List<Appointment> pendingAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.PENDING)
                .collect(Collectors.toList());

        for(Appointment appointment : pendingAppointments) {
            rejectAppointment(appointment.getId());
        }
    }

    @Override
    @Transactional
    public void cancelAllAppointmentsByServiceOfferedId(Long id) {
        businessServiceOfferedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        List<Appointment> appointments = appointmentRepository.findByServiceOffered_Id(id);
        List<Appointment> bookedAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());
        for(Appointment appointment : bookedAppointments) {
            cancelAppointmentByOwner(appointment.getId());
        }

        List<Appointment> pendingAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentStatus() == AppointmentStatus.PENDING)
                .collect(Collectors.toList());

        for(Appointment appointment : pendingAppointments) {
            rejectAppointment(appointment.getId());
        }
    }

    private AppointmentCard convertToCard(Appointment newAppointment) {
        AppointmentCard result = new AppointmentCard();
        result.setId(newAppointment.getId());
        result.setAppointmentId(newAppointment.getAppointmentId());
        result.setBookedBy(newAppointment.getBookedBy().getId());
        result.setCustomerId(newAppointment.getBookedBy().getCustomerId());
        result.setServiceOffered(newAppointment.getServiceOffered().getId());
        result.setServiceOfferedId(newAppointment.getServiceOffered().getServiceOfferedId());
        result.setDateTime(newAppointment.getAppointmentDateTime());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        result.setBid(newAppointment.getServiceOffered().getBusiness().getBusinessId());
        result.setRescheduledAt(newAppointment.getRescheduledAt());
        return result;
    }

    public AppointmentDTO convertToDTO(Appointment newAppointment) {
        AppointmentDTO result = new AppointmentDTO();
        result.setId(newAppointment.getId());
        result.setAppointmentId(newAppointment.getAppointmentId());
        result.setBookedBy(newAppointment.getBookedBy().getId());
        result.setServiceOffered(newAppointment.getServiceOffered().getId());
        result.setDateTime(newAppointment.getAppointmentDateTime());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        return result;
    }

    private Appointment convertToEntity(AppointmentDTO appointmentDTO, BusinessServiceOffered serviceOffered, Customer customer) {
        Appointment appointment = new Appointment();
        appointment.setId(appointmentDTO.getId());
        appointment.setAppointmentId(appointmentDTO.getAppointmentId());
        appointment.setAppointmentDateTime(appointmentDTO.getDateTime());
        appointment.setNotes(appointmentDTO.getNotes());
        appointment.setAppointmentStatus(appointmentDTO.getAppointmentStatus());
        appointment.setServiceOffered(serviceOffered);
        appointment.setBookedBy(customer);
        appointment.setBusiness(serviceOffered.getBusiness());
        return appointment;
    }

    private boolean isAppointmentIdAvailable(String appointmentId) {
        return appointmentRepository.existsByAppointmentId(appointmentId);
    }

    private String generateAppointmentId() {
        String apptId =  "APPT-" + System.currentTimeMillis();
        if (isAppointmentIdAvailable(apptId)) {
             return generateAppointmentId();
        }
        return apptId;
    }
}
