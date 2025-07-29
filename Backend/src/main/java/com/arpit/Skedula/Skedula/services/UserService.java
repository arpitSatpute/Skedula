package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserService {

    UserDetails loadUserByUsername(String username);

    User getUserById(Long userId);

    User loadUserByRole(Role role);

    UserDTO getCurrentUser();
}
