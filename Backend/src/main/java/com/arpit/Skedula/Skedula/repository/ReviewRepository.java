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

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH c.user LEFT JOIN FETCH r.service WHERE r.business.id = :businessId ORDER BY r.createdAt DESC")
    List<Review> findByBusiness_IdOrderByCreatedAtDesc(@Param("businessId") Long businessId);

    Optional<Review> findByAppointment_Id(Long appointmentId);

    boolean existsByAppointment_Id(Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.business.id = :businessId")
    Double getAverageRatingByBusinessId(@Param("businessId") Long businessId);

    Long countByBusiness_Id(Long businessId);

    /** Rating distribution: returns [rating, count] pairs */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.business.id = :businessId GROUP BY r.rating")
    List<Object[]> getRatingDistributionByBusinessId(@Param("businessId") Long businessId);

    /** Monthly avg rating: returns [yearMonth, avgRating] e.g. ['2024-08', 4.3] */
    @Query("SELECT CONCAT(YEAR(r.createdAt), '-', LPAD(CAST(MONTH(r.createdAt) AS string), 2, '0')), AVG(r.rating) FROM Review r WHERE r.business.id = :businessId GROUP BY YEAR(r.createdAt), MONTH(r.createdAt) ORDER BY YEAR(r.createdAt), MONTH(r.createdAt)")
    List<Object[]> getMonthlyRatingByBusinessId(@Param("businessId") Long businessId);
}

