package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.SignupDTO;
import com.arpit.Skedula.Skedula.dto.UserDTO;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.Wallet;
import com.arpit.Skedula.Skedula.entity.enums.Role;
import com.arpit.Skedula.Skedula.exceptions.RuntimeConflictException;
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
            User existingUser = existingUserOpt.get();
            if (existingUser.getRoles().contains(signupDto.getRole())) {
                throw new RuntimeConflictException("The user already exists with email id: "
                        + signupDto.getEmail() + " and role: " + signupDto.getRole());
            } else {
                existingUser.getRoles().add(signupDto.getRole());
                User updatedUser = userRepository.save(existingUser);

                UserDTO userDTO = modelMapper.map(updatedUser, UserDTO.class);
                // Create associated entity if needed
                if (signupDto.getRole() == Role.CUSTOMER) {
                    customerService.createCustomer(userDTO);
                    // TODO create customer wallet
                }
                return userDTO;
            }
        }

        // Validate allowed roles
        if (signupDto.getRole() != Role.CUSTOMER && signupDto.getRole() != Role.OWNER) {
            throw new RuntimeConflictException("Role is required for signup");
        }
        User mappedUser = modelMapper.map(signupDto, User.class);
        mappedUser.setRoles(Set.of(signupDto.getRole()));
        mappedUser.setPassword(passwordEncoder.encode(mappedUser.getPassword()));
        User savedUser = userRepository.save(mappedUser);
        walletService.createWallet(savedUser);
        UserDTO userDTO = modelMapper.map(savedUser, UserDTO.class);

        // Create associated entity based on role
        if (signupDto.getRole() == Role.CUSTOMER) {
            customerService.createCustomer(userDTO);
            // TODO create customer wallet
        }
        return userDTO;
    }

    @Override
    public String refreshToken(String refreshToken) {
        Long userId = jwtService.getUserIdFromToken(refreshToken);
        User user = userService.getUserById(userId);
        return jwtService.generateAccessToken(user);
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

    private void beAOwner(UserDTO userDTO) {
        if (!userDTO.getRoles().contains(Role.OWNER)) {
            ;
        }
    }
}
