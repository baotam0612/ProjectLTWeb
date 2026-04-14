package com.jewellery.ProjWEB.auth.controller;

import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.repository.AccountRepository;
import com.jewellery.ProjWEB.user.repository.PasswordResetTokenRepository;
import com.jewellery.ProjWEB.user.repository.RoleRepository;
import com.jewellery.ProjWEB.user.repository.UserRepository;
import com.jewellery.ProjWEB.user.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAllWithRoles().stream()
                .map(this::toUserMap)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> body) {
        try {
            String username = getString(body, "username");
            String email = getString(body, "email");
            String password = getString(body, "password");
            String fullName = getString(body, "fullName");
            String address = getString(body, "address");
            String phoneNumber = getString(body, "phoneNumber");
            boolean enabled = asBoolean(body.get("enabled"), true);

            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập không được để trống"));
            }
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống"));
            }
            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu không được để trống"));
            }
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Tên đăng nhập đã tồn tại: " + username));
            }
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email đã tồn tại: " + email));
            }

            Role role = resolveRole(getString(body, "role"));

            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .address(address)
                    .phoneNumber(phoneNumber)
                    .enabled(enabled)
                    .roles(Set.of(role))
                    .build();

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Thêm người dùng thành công",
                    "user", toUserMap(user)));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            User user = userRepository.findByIdWithRoles(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));

            String username = getString(body, "username");
            String email = getString(body, "email");
            String password = getString(body, "password");
            String fullName = getString(body, "fullName");
            String address = getString(body, "address");
            String phoneNumber = getString(body, "phoneNumber");

            if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
                userRepository.findByUsername(username)
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(id)) {
                                throw new IllegalArgumentException("Tên đăng nhập đã tồn tại: " + username);
                            }
                        });
                user.setUsername(username);
            }

            if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
                userRepository.findByEmail(email)
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(id)) {
                                throw new IllegalArgumentException("Email đã tồn tại: " + email);
                            }
                        });
                user.setEmail(email);
            }

            if (password != null && !password.isBlank()) {
                user.setPassword(passwordEncoder.encode(password));
            }

            if (body.containsKey("enabled")) {
                user.setEnabled(asBoolean(body.get("enabled"), user.isEnabled()));
            }

            if (fullName != null) {
                user.setFullName(fullName);
            }
            if (address != null) {
                user.setAddress(address);
            }
            if (phoneNumber != null) {
                user.setPhoneNumber(phoneNumber);
            }

            if (body.containsKey("role")) {
                Role role = resolveRole(getString(body, "role"));
                user.getRoles().clear();
                user.getRoles().add(role);
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật người dùng thành công",
                    "user", toUserMap(user)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findByIdWithRoles(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication != null ? authentication.getName() : null;
            if (currentUsername != null && currentUsername.equals(user.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Không thể tự xóa chính tài khoản đang đăng nhập"));
            }

            if (user.isEnabled()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Chỉ xóa được người dùng đang ngừng hoạt động"));
            }

            // Xóa dữ liệu phụ thuộc trước để tránh lỗi khóa ngoại (parent/child).
            passwordResetTokenRepository.deleteByUser(user);
            verificationTokenRepository.deleteByUser(user);

            // Account là thực thể cha của nhiều bảng nghiệp vụ, chỉ tách liên kết user để giữ dữ liệu lịch sử.
            accountRepository.findByUserId(user.getId()).ifPresent(account -> {
                account.setUser(null);
                accountRepository.save(account);
            });

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không thể xóa người dùng vì còn dữ liệu liên quan"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        try {
            User user = userRepository.findByIdWithRoles(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));

            String roleName = getString(body, "role");
            boolean replace = asBoolean(body.get("replace"), false);

            Role role = resolveRole(roleName);

            if (replace) {
                user.getRoles().clear();
            }
            user.getRoles().add(role);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật vai trò thành công",
                    "user", toUserMap(user)));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> removeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        try {
            User user = userRepository.findByIdWithRoles(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + id));

            String roleName = getString(body, "role");
            Role role = resolveRole(roleName);

            user.getRoles().removeIf(r -> r.getName() == role.getName());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Thu hồi vai trò thành công",
                    "user", toUserMap(user)));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    private Map<String, Object> toUserMap(User user) {
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName() == null ? "" : user.getFullName(),
                "address", user.getAddress() == null ? "" : user.getAddress(),
                "phoneNumber", user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
                "enabled", user.isEnabled(),
                "createdAt", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString(),
                "roles", user.getRoles().stream().map(r -> r.getName().name()).toList());
    }

    private Role resolveRole(String roleName) {
        String normalized = normalizeRoleName(roleName);
        ERole eRole = ERole.valueOf(normalized);

        return roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role chưa được khởi tạo trong DB: " + normalized));
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return ERole.ROLE_USER.name();
        }

        String value = roleName.trim().toUpperCase();
        if ("ADMIN".equals(value)) {
            return ERole.ROLE_ADMIN.name();
        }
        if ("USER".equals(value)) {
            return ERole.ROLE_USER.name();
        }
        if (!value.startsWith("ROLE_")) {
            value = "ROLE_" + value;
        }

        if (!value.equals(ERole.ROLE_ADMIN.name()) && !value.equals(ERole.ROLE_USER.name())) {
            throw new IllegalArgumentException("Role không hợp lệ: " + roleName + ". Chỉ hỗ trợ ROLE_USER hoặc ROLE_ADMIN");
        }

        return value;
    }

    private boolean asBoolean(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private String getString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value == null ? null : String.valueOf(value).trim();
    }
}
