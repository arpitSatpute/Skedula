package com.arpit.Skedula.Skedula.repository;

import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    User findByRoles(Role role);

    Long countByRoles(Role role);
}

