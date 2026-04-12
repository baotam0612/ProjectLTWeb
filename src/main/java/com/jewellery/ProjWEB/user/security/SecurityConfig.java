package com.jewellery.ProjWEB.user.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration for JWT-based stateless authentication.
 *
 * - Disables CSRF and HTTP sessions (uses stateless JWT tokens).
 * - Permits `/api/auth/**` and `/api/public/**` as public endpoints.
 * - Restricts `/api/admin/**` to `ROLE_ADMIN` authority.
 * - Registers `JwtAuthenticationFilter` before the username/password filter to
 *   extract and validate JWT on each request.
 */
@Configuration("jwtSecurityConfig")
@Profile("!dev")
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Configure HTTP security pipeline for stateless JWT-based auth
        http
            // Enable CORS using our custom source (allows browser clients from allowed origins)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Disable CSRF because we do not use server-side sessions or cookies for auth
            .csrf(AbstractHttpConfigurer::disable)
            // Do not create or use HTTP session; every request must provide JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Define route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow anonymous access to authentication endpoints (login/register)
                .requestMatchers("/api/auth/**").permitAll()
                // Allow anonymous access to any public endpoints
                .requestMatchers("/api/public/**").permitAll()
                // Restrict administrative endpoints to users with ROLE_ADMIN
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                // All other endpoints require an authenticated principal
                .anyRequest().authenticated())
            // Use DAO auth provider wired with our UserDetailsService and password encoder
            .authenticationProvider(authenticationProvider())
            // Place our JWT validation filter before the UsernamePasswordAuthenticationFilter
            // so that requests bearing a valid token are treated as authenticated
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Build CORS policy allowing requests from development origins (adjust in prod)
        CorsConfiguration config = new CorsConfiguration();
        // Allow any localhost origin (use patterns to permit varying ports)
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"));
        // Permit typical HTTP methods used by the SPA/backend API
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow all headers (Authorization will be sent by browser)
        config.setAllowedHeaders(List.of("*"));
        // Allow credentials (cookies) if needed by clients; for JWT this is usually false,
        // but set to true here to support flexible dev scenarios that might use cookies.
        config.setAllowCredentials(true);

        // Register the configuration for all paths and return the source used by Spring
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // DaoAuthenticationProvider wired with custom UserDetailsService and BCrypt password encoder
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
