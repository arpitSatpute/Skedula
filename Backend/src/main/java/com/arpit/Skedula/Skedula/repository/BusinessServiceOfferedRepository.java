package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.arpit.Skedula.Skedula.entity.BusinessServiceOffered;

import java.util.List;

@Repository
public interface BusinessServiceOfferedRepository extends JpaRepository<BusinessServiceOffered, Long> {


    @Query("SELECT b FROM BusinessServiceOffered b WHERE " +
            "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<BusinessServiceOffered> findByKeyword(String keyword, Pageable pageable);

    List<BusinessServiceOffered> findByBusiness_Owner_Email(String businessOwnerEmail);
}
