package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Business;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {

    boolean existsByName(String name);

    @Query("SELECT b FROM Business b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.city) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.state) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.country) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Business> findByKeyword(String keyword, Pageable pageable);
}