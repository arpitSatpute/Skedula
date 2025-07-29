package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.RazorpayAmount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RazorPayAmountRepository extends JpaRepository<RazorpayAmount,Long> {
    Optional<RazorpayAmount> findByReceiptOrderId(String receipt);

    Optional<RazorpayAmount> findByRazorpayOrderId(String orderId);
}
