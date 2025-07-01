package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.RazorPayTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RazorpayTransactionRepository extends JpaRepository<RazorPayTransaction, Long> {
}
