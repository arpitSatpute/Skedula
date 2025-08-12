package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer,Long> {
    boolean existsByCustomerId(String customerId);

    Optional<Customer> findByUser_Email(String email);
}
