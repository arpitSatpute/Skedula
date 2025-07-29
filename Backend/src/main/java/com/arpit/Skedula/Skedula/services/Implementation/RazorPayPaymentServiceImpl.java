package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.RequestRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.dto.RequestRazorpayPaymentVerifyDTO;
import com.arpit.Skedula.Skedula.dto.ResponseRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.entity.RazorPayTransaction;
import com.arpit.Skedula.Skedula.entity.RazorpayAmount;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.RazorPayAmountRepository;
import com.arpit.Skedula.Skedula.repository.RazorpayTransactionRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.RazorPayPaymentService;
import com.arpit.Skedula.Skedula.services.RazorpayTransactionService;
import com.arpit.Skedula.Skedula.services.WalletService;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

import static com.razorpay.Utils.verifySignature;

@Service
@RequiredArgsConstructor
public class RazorPayPaymentServiceImpl implements RazorPayPaymentService {

    private final RazorPayAmountRepository razorPayAmountRepository;
    private final RazorpayTransactionService razorpayTransactionService;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final RazorpayTransactionRepository razorpayTransactionRepository;
    @Value("${razorpay.keyId}")
    private String razorPayKey;

    @Value("${razorpay.secret.key}")
    private String razorPaySecret;


    @Override
    public boolean isOwnerOfPayment(String email) {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new ResourceNotFoundException("User not found in security context");
        }
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (currentEmail == null) {
            throw new ResourceNotFoundException("User not found in security context");
        }
        return currentEmail.equals(email);
    }

    @Override
    public ResponseRazorPayAmountDTO createRazorpayPaymentOrder(RequestRazorPayAmountDTO requestRazorpayAmount) {

        try {
            // Validate user
            User user = userRepository.findByEmail(requestRazorpayAmount.getEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + requestRazorpayAmount.getEmail()));
            // Validate amount
            if (requestRazorpayAmount.getAmount() == null || requestRazorpayAmount.getAmount().compareTo(BigDecimal.valueOf(50)) < 0) {
                throw new IllegalArgumentException("Amount must be greater than or equal to 50");
            }
            // Create RazorpayAmount entity
            RazorpayAmount razorpayAmount = RazorpayAmount.builder()
                    .amount(requestRazorpayAmount.getAmount())
                    .receiptOrderId(generateReceiptOrderId())
                    .currency(requestRazorpayAmount.getCurrency())
                    .razorpayOrderId(null)
                    .build();
            // Initialize Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorPayKey, razorPaySecret);

            System.out.println("Json Creating Order");
            // Prepare Razorpay order payload
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("amount", razorpayAmount.getAmount().multiply(BigDecimal.valueOf(100))); // Convert to paise
            jsonObject.put("currency", razorpayAmount.getCurrency());
            jsonObject.put("receipt", razorpayAmount.getReceiptOrderId());

            System.out.println("Creating Razorpay Order");

            // Create Razorpay order
            Order order = razorpayClient.orders.create(jsonObject);

            // set Razorpay order ID in RazorpayAmount
            razorpayAmount.setRazorpayOrderId(order.get("id").toString());
            // Saving RazorpayAmount to the repository
            razorPayAmountRepository.save(razorpayAmount);


            System.out.println("Created Razorpay Order: " + order.get("id"));

            RazorPayTransaction razorPayTransaction = RazorPayTransaction.builder()
                    .razorpay_amount(razorpayAmount)
                    .transactionId(order.get("id").toString())
                    .amount(razorpayAmount.getAmount())
                    .razorpayOrderStatus(order.get("status").toString())
                    .build();


            // Link transaction to RazorpayAmount
            if (razorpayAmount.getTransaction() == null) {
                razorpayAmount.setTransaction(new ArrayList<>());
            }

            razorpayAmount.getTransaction().add(razorPayTransaction);


            // Prepare response
            ResponseRazorPayAmountDTO response = new ResponseRazorPayAmountDTO();
            response.setAmount(razorpayAmount.getAmount().multiply(BigDecimal.valueOf(100))); // In paise
            response.setCurrency(razorpayAmount.getCurrency());
            response.setReceiptOrderId(razorpayAmount.getReceiptOrderId());
            response.setRazorpayOrderId(order.get("id")); // Razorpay order ID

            // Add money to wallet
//            walletService.addMoney(user, razorpayAmount.getAmount(), razorPayTransaction.getTransactionId(), null);

            // Save transaction details
            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred: " + e.getMessage(), e);
        }
    }

    private RazorpayAmount createRazorPayAmount(RequestRazorPayAmountDTO requestPayment) {
        RazorpayAmount razorPayAmount = RazorpayAmount.builder()
                .amount(requestPayment.getAmount())
                .currency(requestPayment.getCurrency())
                .receiptOrderId(generateReceiptOrderId())
                .build();

        return razorPayAmountRepository.save(razorPayAmount);
    }

    @Override
    public Void verifyRazorpayPayment(RequestRazorpayPaymentVerifyDTO verifyDTO) {

        User user = userRepository.findByEmail(verifyDTO.getEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + verifyDTO.getEmail()));

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorPayKey, razorPaySecret);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("razorpay_order_id", verifyDTO.getRazorpayOrderId());
            jsonObject.put("razorpay_payment_id", verifyDTO.getRazorpayPaymentId());
            jsonObject.put("razorpay_signature", verifyDTO.getRazorpaySignature());

            // Verify the payment signature
            Payment payment = razorpayClient.payments.fetch(verifyDTO.getRazorpayPaymentId());

            if(!verifySignature(verifyDTO.getRazorpayOrderId()+"|"+verifyDTO.getRazorpayPaymentId(), verifyDTO.getRazorpaySignature(), razorPaySecret)) {
                throw new RuntimeException("Signature verification failed.");
            }


                //TODO Fix Error
            // If verification is successful, update the transaction status
            RazorpayAmount razorpayAmount = razorPayAmountRepository.findByRazorpayOrderId(verifyDTO.getRazorpayOrderId()).orElseThrow(() -> new ResourceNotFoundException("Razorpay amount not found with order ID: " + verifyDTO.getRazorpayOrderId()));

            walletService.addMoney(user, razorpayAmount.getAmount(), verifyDTO.getRazorpayPaymentId(), null);

            RazorPayTransaction transaction = RazorPayTransaction.builder()
                    .razorpay_amount(razorpayAmount)
                    .transactionId(verifyDTO.getRazorpayPaymentId())
                    .amount(razorpayAmount.getAmount())
                    .razorpayOrderStatus(payment.get("status").toString())
                    .build();

            razorpayTransactionRepository.save(transaction);
            System.out.println("Payment verified successfully. Amount credited to wallet.");
            return null;

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to verify Razorpay payment: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred: " + e.getMessage(), e);
        }

    }

    private String generateReceiptOrderId() {
        String receipt = "RZPTX"+ UUID.randomUUID().toString().replace("-", "");
        if(razorPayAmountRepository.findByReceiptOrderId(receipt).isPresent()) {
            return generateReceiptOrderId();
        }
        return receipt;

    }


//    private String generateRazorpayTransactionId() {
//        String receipt = "RZSKTX"+ UUID.randomUUID().toString().replace("-", "");
//        if(razorPayAmountRepository.findByReceiptOrderId(receipt).isPresent()) {
//            return generateReceiptOrderId();
//        }
//        return receipt;
//
//    }

}
