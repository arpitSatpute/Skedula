package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.EscrowTransaction;
import com.arpit.Skedula.Skedula.entity.enums.EscrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {

    Optional<EscrowTransaction> findByAppointment(Appointment appointment);

    Optional<EscrowTransaction> findByAppointment_Id(Long appointmentId);

    Optional<EscrowTransaction> findByEscrowTransactionId(String escrowTransactionId);

    List<EscrowTransaction> findByStatus(EscrowStatus status);

    List<EscrowTransaction> findAllByOrderByCreatedAtDesc();
}
