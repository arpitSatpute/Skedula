package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.entity.RazorPayTransaction;
import org.springframework.stereotype.Service;

@Service
public interface RazorpayTransactionService {

    void createNewRazorpayTransaction(RazorPayTransaction razorpayTransaction);



}
