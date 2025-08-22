package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.SignupDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Business;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Wallet;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.RuntimeConflictException;
import com.arpit.Skedula.Skedula.repository.BusinessRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.repository.WalletRepository;
import com.arpit.Skedula.Skedula.security.JWTService;
import com.arpit.Skedula.Skedula.services.AuthService;
import com.arpit.Skedula.Skedula.services.CustomerService;
import com.arpit.Skedula.Skedula.services.WalletService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {



    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final UserServiceImpl userService;
    private final CustomerService customerService;
    private final WalletService walletService;
    private final WalletRepository walletRepository;
    private final BusinessRepository businessRepository;



    @Override
    public String[] login(String email, String password, Role role) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        User user = (User) authentication.getPrincipal();
        if(!(user.getRoles().contains(role))) {
            throw new RuntimeConflictException("User with email: " + email + " does not have the required role: " + role);
        }
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new String[]{accessToken, refreshToken};
    }

    @Override
    @Transactional
    public UserDTO signup(SignupDTO signupDto) {
        Optional<User> existingUserOpt = userRepository.findByEmail(signupDto.getEmail());
        if (existingUserOpt.isPresent()) {
            throw new RuntimeConflictException("The user already exists with email id: " + signupDto.getEmail());
        }


        // Validate allowed roles
        if (signupDto.getRole() != Role.CUSTOMER && signupDto.getRole() != Role.OWNER) {
            throw new RuntimeConflictException("Role is required for signup");
        }
        User mappedUser = new User();
        mappedUser.setName(signupDto.getName());
        mappedUser.setEmail(signupDto.getEmail());
        mappedUser.setImageUrl(null);
        mappedUser.setPassword(signupDto.getPassword());
        // Set the role and encode the password
        mappedUser.setRoles(Set.of(signupDto.getRole()));
        mappedUser.setPassword(passwordEncoder.encode(mappedUser.getPassword()));
        User savedUser = userRepository.save(mappedUser);
        walletService.createWallet(savedUser);
        UserDTO userDTO = modelMapper.map(savedUser, UserDTO.class);

        // Create associated entity based on role
        if (signupDto.getRole() == Role.CUSTOMER) {
            customerService.createCustomer(savedUser);
        }

        return userDTO;
    }

    @Override
    public String refreshToken(String refreshToken) {
        Long userId = jwtService.getUserIdFromToken(refreshToken);
        User user = userService.getUserById(userId);
        return jwtService.generateRefreshToken(user);
    }

    @Override
    public Void logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return null;
    }


}
