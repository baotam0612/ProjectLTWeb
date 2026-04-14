package com.jewellery.ProjWEB.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jewellery.ProjWEB.auth.dto.*;
import com.jewellery.ProjWEB.auth.token.PasswordResetToken;
import com.jewellery.ProjWEB.auth.token.VerificationToken;
import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.mail.EmailService;
import com.jewellery.ProjWEB.security.CustomUserDetailsService;
import com.jewellery.ProjWEB.security.JwtService;
import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.repository.*;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + request.getEmail());
        }

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found. Please initialize roles."));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .enabled(false)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);

        AccountEntity account = new AccountEntity();
        account.setUser(user);
        account.setUsername(user.getUsername());
        account.setFullName(user.getFullName());
        account.setAddress(user.getAddress());
        account.setPhoneNumber(user.getPhoneNumber());
        account.setCreatedAt(LocalDateTime.now());
        accountRepository.save(account);

        VerificationToken verificationToken = new VerificationToken(user);
        verificationTokenRepository.save(verificationToken);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken.getToken());
        } catch (Exception e) {
            log.error("Could not send verification email to {}: {}", user.getEmail(), e.getMessage());
        }

        log.info("New user registered: {}", user.getUsername());

        return AuthResponse.builder()
                .message("Registration successful! Please check your email to verify your account.")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new DisabledException("Account not verified. Please check your email.");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        log.info("User logged in: {}", user.getUsername());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getFullName(), user.getEmail(), roles);
    }

    @Override
    public String verifyEmail(String tokenValue) {
        VerificationToken token = verificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token."));

        if (token.isUsed()) {
            throw new IllegalArgumentException("Verification token has already been used.");
        }
        if (token.isExpired()) {
            throw new IllegalArgumentException("Verification token has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        log.info("Email verified for user: {}", user.getUsername());
        return "Email verified successfully! You can now log in.";
    }

    @Override
    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + email));

        if (user.isEnabled()) {
            throw new IllegalArgumentException("Account is already verified.");
        }

        verificationTokenRepository.deleteByUser(user);

        VerificationToken newToken = new VerificationToken(user);
        verificationTokenRepository.save(newToken);

        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), newToken.getToken());

        return "Verification email resent. Please check your inbox.";
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request, String originUrl) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found with email: " + request.getEmail()));

        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken resetToken = new PasswordResetToken(user);
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken.getToken(), originUrl);

        log.info("Password reset email sent to: {}", user.getEmail());
        return "Password reset email sent. Please check your inbox.";
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Reset token has already been used.");
        }
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getUsername());
        return "Password reset successfully! You can now log in with your new password.";
    }
}
