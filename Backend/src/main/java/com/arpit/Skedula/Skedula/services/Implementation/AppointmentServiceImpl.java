// File: `src/main/java/com/arpit/Skedula/Skedula/services/Implementation/AppointmentServiceImpl.java`
package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.AppointmentDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.BusinessServiceOfferedRepository;
import com.arpit.Skedula.Skedula.repository.CustomerRepository;
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


    @Override
    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO appointmentDTO) {

        // Getting Total Slots Count in ServiceOffered
        Business business = businessRepository.findById(appointmentDTO.getBusinessId()).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + appointmentDTO.getBusinessId()));

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointmentDTO.getServiceOffered()).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        Long total = serviceOffered.getTotalSlots();

        // Getting count of already available services, date and status
        Long booked = appointmentRepository.countByServiceOffered_IdAndAppointmentDateAndAppointmentStatus(appointmentDTO.getServiceOffered(), appointmentDTO.getDate(), appointmentDTO.getAppointmentStatus());
        Customer customer = customerRepository.findById(appointmentDTO.getBookedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointmentDTO.getBookedBy()));
        if(booked < total) {
            Appointment newAppointment = convertToEntity(appointmentDTO, serviceOffered, customer);
            newAppointment.setAppointmentStatus(AppointmentStatus.PENDING);

            appointmentRepository.save(newAppointment);
            AppointmentDTO result = convertToDTO(newAppointment);
            return result;
        }
        return null;
    }

    @Override
    @Transactional
    public AppointmentDTO approveAppointment(Long id) {
        AppointmentDTO appointmentDTO = getAppointmentById(id);

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointmentDTO.getServiceOffered())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointmentDTO.getServiceOffered()));
        Customer customer = customerRepository.findById(appointmentDTO.getBookedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointmentDTO.getBookedBy()));

        appointmentDTO.setAppointmentStatus(AppointmentStatus.BOOKED);
        Appointment result = convertToEntity(appointmentDTO, serviceOffered, customer);

        // Save the appointment first
        Appointment savedAppointment = appointmentRepository.save(result);

        // Wallet Transaction
        paymentService.createNewPayment(savedAppointment);
        paymentService.processPayment(savedAppointment);

        // Return the saved appointment as DTO
        return convertToDTO(savedAppointment);
    }


    @Override
    public AppointmentDTO rejectAppointment(Long id) {
        AppointmentDTO appointment = getAppointmentById(id);

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered()));
        Customer customer = customerRepository.findById(appointment.getBookedBy()).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy()));

        appointment.setAppointmentStatus(AppointmentStatus.REJECTED);
        Appointment result = convertToEntity(appointment, serviceOffered, customer);


        appointmentRepository.save(result);

        return convertToDTO(result);

    }

    @Override
    @Transactional
    public AppointmentDTO doneAppointment(Long id) {
        AppointmentDTO appointment = getAppointmentById(id);

        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(appointment.getServiceOffered())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + appointment.getServiceOffered()));
        Customer customer = customerRepository.findById(appointment.getBookedBy()).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + appointment.getBookedBy()));

        appointment.setAppointmentStatus(AppointmentStatus.DONE);
        Appointment result = convertToEntity(appointment, serviceOffered, customer);

        appointmentRepository.save(result);

        // Rating if possible

        return convertToDTO(result);

    }

    @Override
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return convertToDTO(appointment);

    }

    @Override
    public List<AppointmentDTO> getPendingAppointmentRequest(Long businessId) {
        Business business = businessRepository.findById(businessId).orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointmentList = appointmentRepository.findByBusinessAndAppointmentStatus(business, AppointmentStatus.PENDING);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No pending appointments found for the given business.");
        }
        return appointmentList.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<AppointmentDTO> getAppointmentByCustomerId(Long customerId) {
        Customer customer = customerRepository.findById(customerId).orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        List<Appointment> appointmentList = appointmentRepository.findByBookedBy(customer);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No appointments found for the given customer.");
        }
        return appointmentList.stream()
                .map(this::convertToDTO)
                .toList();
    }


    @Override
    public AppointmentDTO cancelAppointmentByCustomer(Long id){
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        //        paymentService.refundPayment(appointment);

        return convertToDTO(appointment);
    }

    @Override
    public AppointmentDTO cancelAppointmentByOwner(Long id){
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);

        // TODO Wallet Transaction from Business to Customer
        paymentService.refundPayment(appointment);
        // TODO Notify Customer about cancellation


        return (convertToDTO(appointmentRepository.save(appointment)));
    }


    @Override
    public List<AppointmentDTO> getAllAppointmentByStatusRoleUserId(AppointmentStatus status, Role role, Long userId) {

        // For Customer
        if(role.equals(Role.CUSTOMER)) {
            List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_Id(status, role, userId);
            if (appointmentList.isEmpty()) {
                throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
            }
            return appointmentList.stream()
                    .map(this::convertToDTO)
                    .toList();
        }

        // For Business
        List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_Id(status, role, userId);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
        }
        return appointmentList.stream()
                .map(this::convertToDTO)
                .toList();

    }

    @Override
    public List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdDate(AppointmentStatus status, Role role, Long userId, LocalDate date) {
        if(role.equals(Role.CUSTOMER)) {
            List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndAppointmentDate(status, role, userId, date);
            if (appointmentList.isEmpty()) {
                throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
            }
            return appointmentList.stream()
                    .map(this::convertToDTO)
                    .toList();
        }

        // For Business
        List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndAppointmentDate(status, role, userId, date);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
        }
        return appointmentList.stream()
                .map(this::convertToDTO)
                .toList();


    }

    @Override
    public List<AppointmentDTO> getAllAppointmentByStatusRoleUserIdServiceId(AppointmentStatus status, Role role, Long userId, Long serviceId) {
        if(role.equals(Role.CUSTOMER)) {
            List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBookedBy_IdAndServiceOffered_Id(status, role, userId, serviceId);
            if (appointmentList.isEmpty()) {
                throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
            }
            return appointmentList.stream()
                    .map(this::convertToDTO)
                    .toList();
        }

        // For Business
        List<Appointment> appointmentList = appointmentRepository.getAppointmentByAppointmentStatusAndBookedBy_User_RolesAndBusiness_IdAndServiceOffered_Id(status, role, userId, serviceId);
        if (appointmentList.isEmpty()) {
            throw new ResourceNotFoundException("No appointments found for the given status, role, and customer.");
        }
        return appointmentList.stream()
                .map(this::convertToDTO)
                .toList();
    }


    @Override
    public List<AppointmentDTO> getAllAppointmentsByBusinessIdAndServiceId(Long businessId, Long serviceId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        BusinessServiceOffered serviceOffered = businessServiceOfferedRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndServiceOffered_Id(businessId, serviceId);

        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public  List<AppointmentDTO> getAllAppointmentsByBusinessId(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        List<Appointment> appointments = appointmentRepository.findByBusiness_Id(businessId);

        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

    }

    @Override
     public List<AppointmentDTO> getAppointmentsOnAndAfterDate(LocalDate date, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateIsGreaterThanEqual(businessId, date);

        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsBeforeDate(LocalDate date, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));
        List<Appointment> appointments = appointmentRepository.findByBusiness_IdAndAppointmentDateBefore(businessId, date);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO convertToDTO(Appointment newAppointment) {
        AppointmentDTO result = new AppointmentDTO();
        result.setId(newAppointment.getId());
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
        appointment.setAppointmentDate(appointmentDTO.getDate());
        appointment.setNotes(appointmentDTO.getNotes());
        appointment.setAppointmentStatus(appointmentDTO.getAppointmentStatus());
        appointment.setServiceOffered(serviceOffered);
        appointment.setBookedBy(customer);
        appointment.setBusiness(serviceOffered.getBusiness());
        return appointment;
    }
}