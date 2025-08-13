package com.arpit.Skedula.Skedula.strategies;

import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.Payment;
import com.arpit.Skedula.Skedula.entity.Wallet;
import com.arpit.Skedula.Skedula.entity.enums.PaymentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
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

        Business business = payment.getAppointment().getBusiness();
        Customer customer = payment.getAppointment().getBookedBy();

        Wallet customerWallet = walletRepository.findByUserId(customer.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found"));


        if(customerWallet.getBalance().compareTo(payment.getAmount()) < 0) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Insufficient balance in wallet: payment failed");
        }

        walletService.deductMoney(customer.getUser(), payment.getAmount(), generateTransactionId(), payment.getAppointment());

        BigDecimal businessShare = payment.getAmount().multiply(BigDecimal.ONE.subtract(PLATFORM_FEES));
        walletService.addMoney(business.getOwner(), businessShare, generateTransactionId(), payment.getAppointment());
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);


    }

    @Transactional
    public void refundPayment(Payment payment) {
        Business business = payment.getAppointment().getBusiness();
        Customer customer = payment.getAppointment().getBookedBy();

        Wallet businessWallet = walletRepository.findByUserId(business.getId()).orElseThrow(() -> new ResourceNotFoundException("Customer wallet not found"));

        if(businessWallet.getBalance().compareTo(payment.getAmount()) < 0) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Insufficient balance in business wallet: refund failed. Contact Business Owner");
        }
        walletService.deductMoney(business.getOwner(), payment.getAmount(), generateTransactionId(), payment.getAppointment());
        walletService.addMoney(customer.getUser(), payment.getAmount(), generateTransactionId(), payment.getAppointment());
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

    }




    private String generateTransactionId() {
        String id  = "SKETX"+ UUID.randomUUID().toString().replace("-", "");
        if(walletTransactionRepository.findByTransactionId(id).isPresent()) {
            return generateTransactionId(); // Ensure unique transaction ID
        } else {
            return id;
        }
    }

}
