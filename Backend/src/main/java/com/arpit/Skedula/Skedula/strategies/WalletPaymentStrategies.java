package com.arpit.Skedula.Skedula.strategies;

import com.arpit.Skedula.Skedula.entity.Payment;
import com.arpit.Skedula.Skedula.entity.enums.PaymentStatus;
import com.arpit.Skedula.Skedula.repository.PaymentRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.repository.WalletTransactionRepository;
import com.arpit.Skedula.Skedula.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletPaymentStrategies {

    private final BigDecimal PLATFORM_FEES = BigDecimal.valueOf(0.05);
    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional
    public void processPayment(Payment payment) {
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);
    }

    @Transactional
    public void refundPayment(Payment payment) {
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
    }

    @Transactional
    public void refundBookedAppointmentPayment(Payment payment) {
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
    }

    @Transactional
    public void refundBookedAppointmentPayment(Payment payment, BigDecimal customRefundAmount) {
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
    }

    private String generateTransactionId() {
        String id  = "SKETX"+ UUID.randomUUID().toString().replace("-", "");
        if(walletTransactionRepository.findByTransactionId(id).isPresent()) {
            return generateTransactionId();
        } else {
            return id;
        }
    }
}
