package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Payment;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public interface PaymentService {

    void processPayment(Appointment appointment);

    Payment createNewPayment(Appointment appointment);

    void refundPayment(Appointment appointment);

    void refundBookedAppointmentPayment(Appointment appointment);

    void refundBookedAppointmentPayment(Appointment appointment, BigDecimal refundAmount);
}
