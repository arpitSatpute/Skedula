package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBusiness_IdOrderByCreatedAtDesc(Long businessId);

    Optional<Review> findByAppointment_Id(Long appointmentId);

    boolean existsByAppointment_Id(Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.business.id = :businessId")
    Double getAverageRatingByBusinessId(@Param("businessId") Long businessId);

    Long countByBusiness_Id(Long businessId);
}
