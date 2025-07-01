package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.entity.RazorPayTransaction;
import com.arpit.Skedula.Skedula.repository.RazorpayTransactionRepository;
import com.arpit.Skedula.Skedula.services.RazorpayTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RazorpayTransactionServiceImpl implements RazorpayTransactionService {

    private final RazorpayTransactionRepository razorpayTransactionRepository;

    @Override
    public void createNewRazorpayTransaction(RazorPayTransaction razorpayTransaction) {
        razorpayTransactionRepository.save(razorpayTransaction);
    }



}
