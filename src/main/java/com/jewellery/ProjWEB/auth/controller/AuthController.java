package com.jewellery.ProjWEB.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jewellery.ProjWEB.auth.dto.*;
import com.jewellery.ProjWEB.auth.service.AuthService;

import java.util.Map;

/**
 * REST controller for authentication endpoints.
 *
 * Responsibilities:
 * - User registration and sending email verification tokens
 * - User login and returning JWT `AuthResponse`
 * - Email verification and resending verification emails
 * - Password reset request and performing password resets
 *
 * Controller delegates business logic to `AuthService`.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới – gửi email xác nhận
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Delegate registration to service which validates input, creates the user
        // (disabled until email verification), saves DB records and sends verification email.
        AuthResponse response = authService.register(request);

        // Return HTTP 200 with the response message (no JWT until verified).
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Đăng nhập – trả về JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Delegate authentication to service which will authenticate credentials,
        // check account enabled state and generate a JWT on success.
        AuthResponse response = authService.login(request);

        // Return HTTP 200 with token and user info.
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/verify?token=...
     * Xác nhận email sau khi đăng ký
     */
    @GetMapping(value = "/verify", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            // Verify the token and get a human-readable message from service.
            String message = authService.verifyEmail(token);

            // Build a small confirmation HTML page to show in browsers when user
            // follows the verification link from an email.
            String html = """
                <!doctype html><html lang="vi"><head><meta charset="UTF-8">
                <title>Xác nhận Email</title>
                <style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
                .card{background:#fff;padding:40px;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.1);text-align:center;max-width:420px}
                h2{color:#4CAF50}a{display:inline-block;margin-top:20px;padding:12px 24px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:6px}</style>
                </head><body><div class="card">
                <h2>✓ Xác nhận thành công!</h2>
                <p>%s</p>
                <p style="color:#555;margin-top:16px">Bạn có thể đóng trang này và quay lại đăng nhập.</p>
                </div></body></html>
                """
                .formatted(message);

            // Return HTML with 200 OK to render in the browser.
            return ResponseEntity.ok(html);
        } catch (Exception e) {
            // If verification failed build an error HTML page with the exception message
            // and return 400 Bad Request so clients know the operation failed.
            String html = """
                <!doctype html><html lang="vi"><head><meta charset="UTF-8">
                <title>Xác nhận thất bại</title>
                <style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
                .card{background:#fff;padding:40px;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.1);text-align:center;max-width:420px}
                h2{color:#e53935}a{display:inline-block;margin-top:20px;padding:12px 24px;background:#e53935;color:#fff;text-decoration:none;border-radius:6px}</style>
                </head><body><div class="card">
                <h2>✗ Xác nhận thất bại</h2>
                <p>%s</p>
                <p style="color:#555;margin-top:16px">Vui lòng đóng trang này và thử lại.</p>
                </div></body></html>
                """
                .formatted(e.getMessage());

            return ResponseEntity.badRequest().body(html);
        }
    }

    /**
     * POST /api/auth/resend-verification
     * Gửi lại email xác nhận
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        // Expect JSON body like { "email": "user@example.com" }
        String email = body.get("email");
        // Validate presence of email in request body
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        // Delegate to service to create/send a new verification token
        String message = authService.resendVerificationEmail(email);

        // Return a simple JSON message about the outcome
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * POST /api/auth/forgot-password
     * Yêu cầu đặt lại mật khẩu – gửi email reset
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        // Read the Origin header so service can build a frontend reset link
        String originUrl = httpRequest.getHeader("Origin");

        // Delegate to service to create reset token and send email
        String message = authService.forgotPassword(request, originUrl);

        // Return status message to client
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * POST /api/auth/reset-password
     * Đặt lại mật khẩu bằng token nhận qua email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        // Validate token and change password via service implementation
        String message = authService.resetPassword(request);

        // Return success message
        return ResponseEntity.ok(Map.of("message", message));
    }
}
