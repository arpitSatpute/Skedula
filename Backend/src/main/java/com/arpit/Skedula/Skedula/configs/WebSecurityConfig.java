package com.arpit.Skedula.Skedula.configs;

import com.arpit.Skedula.Skedula.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class WebSecurityConfig {

    private static final String[] PUBLIC_ROUTES = {"/auth/**", "/actuator/health", "/v2/api-docs/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/public/**", "/h2-console/**", "/razorpay/**", "/razorpay/pay", "/razorpay/verify",  "/payment.html", "/file/**"};

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity, JwtAuthFilter jwtAuthFilter) throws Exception {
        httpSecurity.sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrfConfig -> csrfConfig.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ROUTES).permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(withDefaults());

        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}