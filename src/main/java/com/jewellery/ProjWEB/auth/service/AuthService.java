package com.jewellery.ProjWEB.auth.service;

import com.jewellery.ProjWEB.auth.dto.*;

/**
 * Service contract for authentication and account-related flows.
 *
 * Implementations should handle registration, login (JWT issuance),
 * email verification, and password reset flows.
 */
public interface AuthService {

    /** Register a new user and initiate email verification. */
    AuthResponse register(RegisterRequest request);

    /** Authenticate user credentials and return JWT-based response. */
    AuthResponse login(LoginRequest request);

    /** Verify an email using a verification token value. */
    String verifyEmail(String token);

    /** Resend a verification email for the given address. */
    String resendVerificationEmail(String email);

    /** Initiate forgot-password flow (send reset email). */
    String forgotPassword(ForgotPasswordRequest request, String originUrl);

    /** Complete the reset-password flow using a reset token. */
    String resetPassword(ResetPasswordRequest request);
}
