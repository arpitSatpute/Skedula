// File: `src/main/java/com/arpit/Skedula/Skedula/services/Implementation/AppointmentServiceImpl.java`
package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.card.AppointmentCard;
import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.*;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.*;
import com.arpit.Skedula.Skedula.services.AppointmentService;

import com.arpit.Skedula.Skedula.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final ModelMapper modelMapper;
    private final BusinessServiceOfferedRepository businessServiceOfferedRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final WalletRepository walletRepository;


    @Override
    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO) {

        if(appointmentDTO.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Appointment date cannot be in the past.");
        }

        // Getting Total Slots Count in ServiceOffered
        Business business = businessRepository.findById(appointmentDTO.getBusinessId()).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + appointmentDTO.getBusinessId()));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointmentDTO.getServiceOffered()).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        Long total = serviceOffered.getTotalSlots();

        // Getting count of already available services, date and status
        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateAndAppointmentStatus(appointmentDTO.getServiceOffered(), appointmentDTO.getDate(), AppointmentStatus.BOOKED);
        Customer customer = customerRepository.findById(appointmentDTO.getBookedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointmentDTO.getBookedBy()));
        Wallet customerWallet = walletRepository.findByUser_Id(customer.getUser().getId()).orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found with id: " + customer.getUser().getId()));
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
        AppointmentDTO result = convertToDTO(newAppointment);
        return result;
    }

    @Override
    public AppointmentDTO approveAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if(appointment.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot approve appointment for past date.");
        }

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered().getId()));
        Customer customer = customerRepository.findById(appointment.getBookedBy().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy().getId()));
        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateAndAppointmentStatus(appointment.getServiceOffered().getId(), appointment.getAppointmentDate(), AppointmentStatus.BOOKED);
        Long total = serviceOffered.getTotalSlots();

        Wallet customerWallet = walletRepository.findByUser_Id(customer.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found with id: " + customer.getUser().getId()));
        if(customerWallet.getBalance().compareTo(serviceOffered.getPrice()) < 0) {
            appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);
            throw new RuntimeException("Insufficient balance in customer wallet to book the appointment.");
        }

        if(booked >= total) {
            throw new RuntimeException("No slots available for the selected service on the given date.");
        }

        appointment.setAppointmentStatus(AppointmentStatus.BOOKED);

        // Save the appointment first
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Wallet Transaction
        paymentService.createNewPayment(savedAppointment);
        paymentService.processPayment(savedAppointment);

        // Return the saved appointment as DTO
        return convertToDTO(savedAppointment);
    }


    @Override
    @Transactional
    public AppointmentDTO rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered()));
        Customer customer = customerRepository.findById(appointment.getBookedBy().getId()).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy()));

        appointment.setAppointmentStatus(AppointmentStatus.REJECTED);

        appointmentRepository.save(appointment);

        return convertToDTO(appointment);

    }

    @Override
    @Transactional
    public AppointmentDTO doneAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered()));
        Customer customer = customerRepository.findById(appointment.getBookedBy().getId()).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy()));

        appointment.setAppointmentStatus(AppointmentStatus.DONE);


        appointmentRepository.save(appointment);

        // Rating if possible

        return convertToDTO(appointment);

    }

    @Override
    public AppointmentCard getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return convertToCard(appointment);

    }

    @Override
    public List<AppointmentCard> getPendingAppointmentRequest(Long businessId) {
        Business business = businessRepository.findById(businessId).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointmentList = appointmentRepository.findByBusinessAndAppointmentStatus(business, AppointmentStatus.PENDING);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No pending appointments found for the given business.");
        }
        return appointmentList.stream()
                .map(this::convertToCard)
                .toList();
    }

    @Override
    public List<AppointmentCard> getAppointmentByCustomerId(Long customerId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        List<Appointment> appointmentList = appointmentRepository.findByBookedBy(customer);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No appointments found for the given customer.");

        }
        return appointmentList.stream()
                .map(this::convertToCard)
                .toList();
    }


    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByCustomer(Long id){
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointmentByOwner(Long id){
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);

        // TODO Wallet Transaction from Business to Customer
        paymentService.refundPayment(appointment);
        // TODO Notify Customer about cancellation


        return (convertToDTO(appointmentRepository.save(appointment)));
    }


    @Override
    public List<AppointmentCard> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndServiceOffered_Id(businessId, serviceId);

        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public  List<AppointmentCard> getAllAppointmentsByBusinessId(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(businessId);

        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());

    }

    @Override
     public List<AppointmentCard> getAppointmentsOnAndAfterDate(LocalDate date, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateIsGreaterThanEqual(businessId, date);

        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentsBeforeDate(LocalDate date, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateBefore(businessId, date);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentCard> getAppointmentBydate(LocalDate date, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDate(businessId, date);
        return appointments.stream()
                .map(this::convertToCard)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Void cancelBooking(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        if(appointment.getAppointmentStatus() != AppointmentStatus.BOOKED) {
            throw new RuntimeException("Only booked appointments can be cancelled.");
        }
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);


        paymentService.refundBookedAppointmentPayment(appointment);

        return null;
    }

    @Override
    @Transactional
    public void cancelAllAppointmentsByBusinessId(Long id) {
        Business business = businessRepository.findById(id)
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
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(id)
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
        result.setDate(newAppointment.getAppointmentDate());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        result.setBid(newAppointment.getServiceOffered().getBusiness().getBusinessId());
        return result;
    }

    public AppointmentDTO convertToDTO(Appointment newAppointment) {
        AppointmentDTO result = new AppointmentDTO();

        result.setId(newAppointment.getId());
        result.setAppointmentId(newAppointment.getAppointmentId());
        result.setBookedBy(newAppointment.getBookedBy().getId());
        result.setServiceOffered(newAppointment.getServiceOffered().getId());
        result.setDate(newAppointment.getAppointmentDate());
        result.setAppointmentStatus(newAppointment.getAppointmentStatus());
        result.setNotes(newAppointment.getNotes());
        result.setBusinessId(newAppointment.getServiceOffered().getBusiness().getId());
        return result;
    }

    private Appointment convertToEntity(AppointmentDTO appointmentDTO, BusinessServiceOffered serviceOffered, Customer customer) {
        Appointment appointment = new Appointment();

        appointment.setId(appointmentDTO.getId());
        appointment.setAppointmentId(appointmentDTO.getAppointmentId());
        appointment.setAppointmentDate(appointmentDTO.getDate());
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
        // Generate a unique appointment ID (e.g., using UUID or a custom logic)
        String apptId =  "APPT-" + System.currentTimeMillis();
        if (isAppointmentIdAvailable(apptId)) {
             generateAppointmentId();
        }
        return apptId;
    }
}