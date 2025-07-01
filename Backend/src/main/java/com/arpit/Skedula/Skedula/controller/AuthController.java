package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.LoginRequestDTO;
import com.arpit.Skedula.Skedula.dto.LoginResponseDTO;
import com.arpit.Skedula.Skedula.dto.SignupDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.services.Implementation.AuthServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping(path = "/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;

    @PostMapping(path = "/signup")
    public ResponseEntity<UserDTO> signUp(@RequestBody SignupDTO signupDto) {
        return new ResponseEntity<>(authService.signup(signupDto), HttpStatus.CREATED);
    }


    @PostMapping(path = "/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO LoginRequestDTO, HttpServletResponse response) {
        String[] tokens = authService.login(LoginRequestDTO.getEmail(), LoginRequestDTO.getPassword(), LoginRequestDTO.getRole());
        Cookie cookie = new Cookie("refreshToken", tokens[1]);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
        response.setHeader("Authorization", tokens[0]);
        return ResponseEntity.ok(new LoginResponseDTO(tokens[0]));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.logout(request, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(HttpServletRequest request) {
        String refreshToken = Arrays.stream(request.getCookies()).
                filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new AuthenticationServiceException("Refresh token not found inside the Cookies"));

        String accessToken = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(new LoginResponseDTO(accessToken));
    }
}
