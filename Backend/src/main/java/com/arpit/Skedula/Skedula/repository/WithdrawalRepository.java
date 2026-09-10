package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

    List<Withdrawal> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Withdrawal> findByUserOrderByCreatedAtDesc(User user);

    Optional<Withdrawal> findByPayoutId(String payoutId);

    Optional<Withdrawal> findByIdempotencyKey(String idempotencyKey);

    Optional<Withdrawal> findByReferenceId(String referenceId);
}
