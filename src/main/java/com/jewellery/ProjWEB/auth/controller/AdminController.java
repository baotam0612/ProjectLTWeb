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
                List<Map<String, Object>> users = userRepository.findAll().stream()
                                .map(u -> Map.<String, Object>of(
                                                "id", u.getId(),
                                                "username", u.getUsername(),
                                                "email", u.getEmail(),
                                                "enabled", u.isEnabled(),
                                                "roles", u.getRoles().stream()
                                                                .map(r -> r.getName().name())
                                                                .toList()))
                                .toList();
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

                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

                String roleName = (String) body.getOrDefault("role", "ROLE_ADMIN");
                boolean replace = Boolean.TRUE.equals(body.get("replace"));

                ERole eRole;
                try {
                        eRole = ERole.valueOf(roleName);
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Role không hợp lệ: " + roleName
                                                        + ". Các role hợp lệ: ROLE_USER, ROLE_ADMIN"));
                }

                Role role = roleRepository.findByName(eRole)
                                .orElseThrow(() -> new RuntimeException("Role chưa được khởi tạo trong DB: " + eRole));

                if (replace) {
                        user.getRoles().clear();
                }
                user.getRoles().add(role);
                userRepository.save(user);

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

                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

                String roleName = (String) body.getOrDefault("role", "ROLE_ADMIN");
                ERole eRole;
                try {
                        eRole = ERole.valueOf(roleName);
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Role không hợp lệ: " + roleName));
                }

                user.getRoles().removeIf(r -> r.getName() == eRole);
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                                "message", "Thu hồi role thành công",
                                "userId", user.getId(),
                                "username", user.getUsername(),
                                "roles", user.getRoles().stream().map(r -> r.getName().name()).toList()));
        }
}
