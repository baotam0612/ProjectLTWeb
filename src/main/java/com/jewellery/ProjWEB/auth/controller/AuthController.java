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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Đăng ký tài khoản mới – gửi email xác nhận

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // đăng nhap – trả về JWT nếu thành công
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // xác nhận khi đăng ký
    @GetMapping(value = "/verify", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            String message = authService.verifyEmail(token);
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
            return ResponseEntity.ok(html);
        } catch (Exception e) {
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

    // gửi lại email xác nhận nếu người dùng chưa nhận được
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        String message = authService.resendVerificationEmail(email);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // yêu cầu đặt lại mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        String originUrl = httpRequest.getHeader("Origin");
        String message = authService.forgotPassword(request, originUrl);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // đặt lại mật khẩu qua email
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
