package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    List<Withdrawal> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
