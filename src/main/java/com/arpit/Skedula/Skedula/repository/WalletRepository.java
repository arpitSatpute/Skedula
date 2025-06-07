package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);

    Optional<Wallet> findByUserId(Long userId);
}
