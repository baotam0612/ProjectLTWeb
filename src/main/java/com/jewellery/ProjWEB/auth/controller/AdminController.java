package com.jewellery.ProjWEB.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.repository.RoleRepository;
import com.jewellery.ProjWEB.user.repository.UserRepository;

import java.util.List;
import java.util.Map;

/**
 * Admin controller for user and role management.
 *
 * Endpoints under `/api/admin/**` require `ROLE_ADMIN` authority
 * (enforced by the class-level `@PreAuthorize`).
 *
 * Provides operations to list users and modify user roles.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;

        /**
         * GET /api/admin/users
         * Lấy danh sách toàn bộ người dùng
         */
        @GetMapping("/users")
        public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
                // Load all users from the repository
                // Map each User entity to a lightweight Map for API responses
                List<Map<String, Object>> users = userRepository.findAll().stream()
                                .map(u -> Map.<String, Object>of(
                                                "id", u.getId(),
                                                "username", u.getUsername(),
                                                "email", u.getEmail(),
                                                // expose whether user has verified their email
                                                "enabled", u.isEnabled(),
                                                // convert role enums to string names
                                                "roles", u.getRoles().stream()
                                                                .map(r -> r.getName().name())
                                                                .toList()))
                                .toList();

                // Return list of user summaries
                return ResponseEntity.ok(users);
        }

        /**
         * PUT /api/admin/users/{id}/role
         * Cập nhật role của user (gán thêm hoặc thay thế toàn bộ)
         *
         * Body: { "role": "ROLE_ADMIN" } (hoặc "ROLE_USER")
         * Body: { "role": "ROLE_ADMIN", "replace": true } — thay thế toàn bộ roles cũ
         */
        @PutMapping("/users/{id}/role")
        public ResponseEntity<Map<String, Object>> updateUserRole(
                        @PathVariable Long id,
                        @RequestBody Map<String, Object> body) {

                // Load user by id or return 500-ish error (runtime exception)
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

                // Read requested role from body, default to ROLE_ADMIN when missing
                String roleName = (String) body.getOrDefault("role", "ROLE_ADMIN");
                // If client passes { replace: true } we will replace existing roles
                boolean replace = Boolean.TRUE.equals(body.get("replace"));

                // Validate that provided roleName matches the ERole enum
                ERole eRole;
                try {
                        eRole = ERole.valueOf(roleName);
                } catch (IllegalArgumentException e) {
                        // Return 400 when client requests an unknown role
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Role không hợp lệ: " + roleName
                                                        + ". Các role hợp lệ: ROLE_USER, ROLE_ADMIN"));
                }

                // Fetch Role entity corresponding to enum (must be pre-seeded in DB)
                Role role = roleRepository.findByName(eRole)
                                .orElseThrow(() -> new RuntimeException("Role chưa được khởi tạo trong DB: " + eRole));

                // Replace existing roles if requested, otherwise add the role
                if (replace) {
                        user.getRoles().clear();
                }
                user.getRoles().add(role);

                // Persist changes
                userRepository.save(user);

                // Return updated user summary including roles
                return ResponseEntity.ok(Map.of(
                                "message", "Cập nhật role thành công",
                                "userId", user.getId(),
                                "username", user.getUsername(),
                                "roles", user.getRoles().stream().map(r -> r.getName().name()).toList()));
        }

        /**
         * DELETE /api/admin/users/{id}/role
         * Thu hồi một role của user
         *
         * Body: { "role": "ROLE_ADMIN" }
         */
        @DeleteMapping("/users/{id}/role")
        public ResponseEntity<Map<String, Object>> removeUserRole(
                        @PathVariable Long id,
                        @RequestBody Map<String, Object> body) {

                // Find user or throw
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

                // Read role name from body with default
                String roleName = (String) body.getOrDefault("role", "ROLE_ADMIN");
                ERole eRole;
                try {
                        // Convert requested string to enum constant
                        eRole = ERole.valueOf(roleName);
                } catch (IllegalArgumentException e) {
                        // Return 400 if role string is invalid
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Role không hợp lệ: " + roleName));
                }

                // Remove matching roles from the user's role collection
                user.getRoles().removeIf(r -> r.getName() == eRole);
                // Persist the updated user
                userRepository.save(user);

                // Return confirmation and current list of roles
                return ResponseEntity.ok(Map.of(
                                "message", "Thu hồi role thành công",
                                "userId", user.getId(),
                                "username", user.getUsername(),
                                "roles", user.getRoles().stream().map(r -> r.getName().name()).toList()));
        }
}
