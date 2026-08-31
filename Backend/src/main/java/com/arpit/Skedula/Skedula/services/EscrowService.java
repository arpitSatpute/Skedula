package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.AdminEscrowResponseDTO;
import com.arpit.Skedula.Skedula.entity.*;

import java.math.BigDecimal;

public interface EscrowService {

    EscrowTransaction holdInEscrow(Appointment appointment, Customer customer, Business business, BusinessServiceOffered service, BigDecimal amount);

    void releaseToBusiness(Appointment appointment);

    void refundToCustomer(Appointment appointment, BigDecimal refundAmount);

    AdminEscrowResponseDTO getAdminEscrowSummary();
}
