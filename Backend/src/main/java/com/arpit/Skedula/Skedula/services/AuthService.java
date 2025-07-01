package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.SignupDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    String[] login(String email, String password, Role role);

    UserDTO signup(SignupDTO signupDTO);

    String refreshToken(String refreshToken);

    Void logout(HttpServletRequest request, HttpServletResponse response);

}
