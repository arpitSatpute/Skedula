package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.OwnerPayoutConfig;
import com.arpit.Skedula.Skedula.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerPayoutConfigRepository extends JpaRepository<OwnerPayoutConfig, Long> {

    Optional<OwnerPayoutConfig> findByUser(User user);

    Optional<OwnerPayoutConfig> findByUser_Id(Long userId);
}
