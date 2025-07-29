package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.RequestRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.dto.RequestRazorpayPaymentVerifyDTO;
import com.arpit.Skedula.Skedula.dto.ResponseRazorPayAmountDTO;
import com.arpit.Skedula.Skedula.entity.RazorpayAmount;
import org.springframework.stereotype.Service;

@Service
public interface RazorPayPaymentService {

    ResponseRazorPayAmountDTO createRazorpayPaymentOrder(RequestRazorPayAmountDTO requestRazorPayAmountDTO);

    Void verifyRazorpayPayment(RequestRazorpayPaymentVerifyDTO verifyDTO);

    boolean isOwnerOfPayment(String email);
}
