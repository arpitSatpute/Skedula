package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Payment;
import com.arpit.Skedula.Skedula.entity.enums.PaymentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.PaymentRepository;
import com.arpit.Skedula.Skedula.services.PaymentService;
import com.arpit.Skedula.Skedula.strategies.WalletPaymentStrategies;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {


    private final PaymentRepository paymentRepository;
    private final WalletPaymentStrategies walletPaymentStrategies;

    @Override
    public void processPayment(Appointment appointment) {
        Payment payment = paymentRepository.findByAppointment(appointment).orElseThrow(()-> new ResourceNotFoundException("Payment not found"));
        walletPaymentStrategies.processPayment(payment);
    }

    @Override
    public Payment createNewPayment(Appointment appointment) {
        Payment payment = Payment.builder()
                .appointment(appointment)
                .amount(appointment.getServiceOffered().getPrice())
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Override
    public void refundPayment(Appointment appointment) {
        Payment payment = paymentRepository.findByAppointment(appointment).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        walletPaymentStrategies.refundPayment(payment);
    }

    @Override
    public void refundBookedAppointmentPayment(Appointment appointment) {
        Payment payment = paymentRepository.findByAppointment(appointment).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        walletPaymentStrategies.refundBookedAppointmentPayment(payment);
    }
}
