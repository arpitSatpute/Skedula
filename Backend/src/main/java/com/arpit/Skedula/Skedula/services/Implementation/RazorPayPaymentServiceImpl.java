package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.RequestRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.dto.ResponseRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.entity.RazorPayTransaction;
import com.arpit.Skedula.Skedula.entity.RazorpayAmount;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.TransactionType;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.RazorPayAmountRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.RazorPayPaymentService;
import com.arpit.Skedula.Skedula.services.RazorpayTransactionService;
import com.arpit.Skedula.Skedula.services.WalletService;
import com.razorpay.Order;
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

@Service
@RequiredArgsConstructor
public class RazorPayPaymentServiceImpl implements RazorPayPaymentService {

    private final RazorPayAmountRepository razorPayAmountRepository;
    private final RazorpayTransactionService razorpayTransactionService;
    private final UserRepository userRepository;
    private final WalletService walletService;
    @Value("${razorpay.keyId}")
    private String razorPayKey;

    @Value("${razorpay.secret.key}")
    private String razorPaySecret;


    @Override
    public boolean isOwnerOfPayment(String email) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user == null) {
            throw new ResourceNotFoundException("User not found in security context");
        }

        return user.getEmail().equals(email);
    }

    @Override
    public ResponseRazorPayAmountDTO createRazorpayPaymentOrder(RequestRazorPayAmountDTO requestRazorpayAmount) {
        try {

            // Validate user
            User user = userRepository.findByEmail(requestRazorpayAmount.getEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + requestRazorpayAmount.getEmail()));
            System.out.println(user);

            // Validate amount
            if (requestRazorpayAmount.getAmount() == null || requestRazorpayAmount.getAmount().compareTo(BigDecimal.valueOf(50)) < 0) {
                throw new IllegalArgumentException("Amount must be greater than or equal to 50");
            }

            // Create RazorpayAmount entity
            RazorpayAmount razorpayAmount = createRazorPayAmount(requestRazorpayAmount);

            // Initialize Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorPayKey, razorPaySecret);

            // Prepare Razorpay order payload
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("amount", razorpayAmount.getAmount().multiply(BigDecimal.valueOf(100))); // Convert to paise
            jsonObject.put("currency", razorpayAmount.getCurrency());
            jsonObject.put("receipt", razorpayAmount.getReceiptOrderId());

            // Create Razorpay order
            Order order = razorpayClient.orders.create(jsonObject);

            // Save transaction details
            RazorPayTransaction razorPayTransaction = RazorPayTransaction.builder()
                    .razorpay_amount(razorpayAmount)
                    .transactionId(order.get("id").toString())
                    .amount(razorpayAmount.getAmount())
                    .razorpayOrderStatus(order.get("status"))
                    .build();
            razorpayTransactionService.createNewRazorpayTransaction(razorPayTransaction);

            // Link transaction to RazorpayAmount
            if (razorpayAmount.getTransaction() == null) {
                razorpayAmount.setTransaction(new ArrayList<>());
            }
            razorpayAmount.getTransaction().add(razorPayTransaction);

            // Add money to wallet
            walletService.addMoney(user, razorpayAmount.getAmount(), razorPayTransaction.getTransactionId(), null);

            // Prepare response
            ResponseRazorPayAmountDTO response = new ResponseRazorPayAmountDTO();
            response.setAmount(razorpayAmount.getAmount().multiply(BigDecimal.valueOf(100))); // In paise
            response.setCurrency(razorpayAmount.getCurrency());
            response.setReceiptOrderId(razorpayAmount.getReceiptOrderId());
            response.setRazorpayOrderId(order.get("id")); // Razorpay order ID

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
