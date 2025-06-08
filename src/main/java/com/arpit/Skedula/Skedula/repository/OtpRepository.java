package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpRepository extends JpaRepository<Otp, String> {

    Otp findByKey(String key);
}
