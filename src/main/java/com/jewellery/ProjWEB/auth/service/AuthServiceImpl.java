package com.jewellery.ProjWEB.auth.service;

import com.jewellery.ProjWEB.entity.AccountEntity;
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
import com.jewellery.ProjWEB.mail.EmailService;
import com.jewellery.ProjWEB.user.security.CustomUserDetailsService;
import com.jewellery.ProjWEB.user.security.JwtService;
import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.repository.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
/**
 * Implementation of `AuthService` handling registration, login, email verification,
 * and password reset.
 *
 * Notes:
 * - Registration creates a disabled `User` and a `VerificationToken`, then emails the user.
 * - Login authenticates via `AuthenticationManager` and generates a JWT using `JwtService`.
 * - Verification and reset tokens are checked for expiration and single-use (`used` flag).
 *
 * The class uses repositories for persistence and `EmailService` for outgoing emails.
 */
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AccountRepository accountRepository ;

    @Override
    /**
     * Register a new user, persist a verification token and send verification email.
     * The created user is initially disabled until email verification completes.
     */
    public AuthResponse register(RegisterRequest request) {
        // Ensure username is unique - prevents duplicate accounts with same username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + request.getUsername());
        }

        // Ensure email is unique - prevents multiple accounts using same email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + request.getEmail());
        }

        // Retrieve the ROLE_USER Role entity which will be assigned to new users
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found. Please initialize roles."));

        // Build a new User entity using the registration request data
        // Important: password is encoded and the account is initially disabled
        // until the user verifies their email.
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                // Hash the raw password before storing
                .password(passwordEncoder.encode(request.getPassword()))
                // Disable account until email verification completes
                .enabled(false)
                // Assign default role
                .roles(Set.of(userRole))
                .build();

        // Persist the new user to the database
        userRepository.save(user);
        AccountEntity account = new AccountEntity() ;
        account.setUser(user);
        account.setUsername(user.getUsername());
        account.setEmail(user.getEmail());
        accountRepository.save(account);
        user.setAccount(account);
        userRepository.save(user);

        // Create a verification token linked to this user (UUID + expiry)
        VerificationToken verificationToken = new VerificationToken(user);
        verificationTokenRepository.save(verificationToken);

        // Attempt to send verification email; don't fail registration on email errors
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken.getToken());
        } catch (Exception e) {
            // Log the error for troubleshooting; user record remains in DB
            log.error("Could not send verification email to {}: {}", user.getEmail(), e.getMessage());
        }

        // Log the registration event for audit/debugging
        log.info("New user registered: {}", user.getUsername());

        // Return a friendly response indicating next steps (email verification)
        return AuthResponse.builder()
                .message("Registration successful! Please check your email to verify your account.")
                .build();
    }

    @Override
    /**
     * Authenticate credentials using `AuthenticationManager`. If successful and the
     * account is enabled, generate a JWT token and return user details + roles.
     */
    public AuthResponse login(LoginRequest request) {
        // Attempt authentication using AuthenticationManager which will delegate to
        // our configured AuthenticationProvider (DaoAuthenticationProvider).
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // Load user entity from DB (used to build response and check enabled flag)
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Deny login if the account hasn't been verified (enabled flag)
        if (!user.isEnabled()) {
            throw new DisabledException("Account not verified. Please check your email.");
        }

        // Load UserDetails (authorities etc.) and generate signed JWT
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        // Collect role names for client to display/authorize UI actions
        List<String> roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toList());

        // Log successful login
        log.info("User logged in: {}", user.getUsername());

        // Return token and basic user info
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), roles);
    }

    @Override
    /**
     * Verify an email by token value. Marks the user `enabled` and marks token as used.
     * Throws exceptions when token is invalid, expired or already used.
     */
    public String verifyEmail(String tokenValue) {
        // Load verification token entity by token string
        VerificationToken token = verificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token."));

        // Ensure token was not previously used
        if (token.isUsed()) {
            throw new IllegalArgumentException("Verification token has already been used.");
        }

        // Ensure token has not expired
        if (token.isExpired()) {
            throw new IllegalArgumentException("Verification token has expired. Please request a new one.");
        }

        // Activate the associated user account
        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        // Mark token as used so it cannot be reused
        token.setUsed(true);
        verificationTokenRepository.save(token);

        // Log and return success message
        log.info("Email verified for user: {}", user.getUsername());
        return "Email verified successfully! You can now log in.";
    }

    @Override
    /**
     * Resend a new verification email. Existing tokens for the user are deleted and a
     * fresh `VerificationToken` is created and emailed.
     */
    public String resendVerificationEmail(String email) {
        // Find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + email));

        // If user already verified don't resend
        if (user.isEnabled()) {
            throw new IllegalArgumentException("Account is already verified.");
        }

        // Remove any existing verification tokens for this user to avoid confusion
        verificationTokenRepository.deleteByUser(user);

        // Create a fresh token and persist it
        VerificationToken newToken = new VerificationToken(user);
        verificationTokenRepository.save(newToken);

        // Send verification email (may throw runtime exception which will propagate)
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), newToken.getToken());

        // Inform caller that email was resent
        return "Verification email resent. Please check your inbox.";
    }

    @Override
    /**
     * Initiate forgot-password flow: create a `PasswordResetToken` and send email
     * with a reset link (originUrl is used to build the frontend link).
     */
    public String forgotPassword(ForgotPasswordRequest request, String originUrl) {
        // Find the user by email address
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException(
                "No account found with email: " + request.getEmail()));

        // Remove any previous reset tokens to ensure single active token
        passwordResetTokenRepository.deleteByUser(user);

        // Create and persist a short-lived password reset token
        PasswordResetToken resetToken = new PasswordResetToken(user);
        passwordResetTokenRepository.save(resetToken);

        // Send the reset email containing the token and origin (frontend URL)
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken.getToken(), originUrl);

        log.info("Password reset email sent to: {}", user.getEmail());
        return "Password reset email sent. Please check your inbox.";
    }

    @Override
    /**
     * Complete password reset using token: validate token, set new password and mark
     * token as used. Ensures password and confirmation match.
     */
    public String resetPassword(ResetPasswordRequest request) {
        // Ensure user provided matching newPassword and confirmPassword
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        // Load the reset token entity using the token string from request
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token."));

        // Token must not have been used already
        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Reset token has already been used.");
        }

        // Token must also still be within its expiry window
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Reset token has expired. Please request a new one.");
        }

        // Update the user's stored password with the encoded new password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark the token as used to invalidate it for future requests
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getUsername());
        return "Password reset successfully! You can now log in with your new password.";
    }
}
