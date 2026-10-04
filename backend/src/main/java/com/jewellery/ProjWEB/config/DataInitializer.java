package com.jewellery.ProjWEB.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.repository.RoleRepository;
import com.jewellery.ProjWEB.user.repository.UserRepository;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:}")
    private String adminUsername;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedRoles();
        seedDefaultAdmin();
    }

    private void seedRoles() {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(new Role(eRole));
                log.info("Seeded role: {}", eRole);
            }
        }
    }

    private void seedDefaultAdmin() {
        boolean configured = !adminUsername.isBlank() && !adminEmail.isBlank() && !adminPassword.isBlank();
        if (configured && adminPassword.length() < 12) {
            throw new IllegalStateException("APP_ADMIN_PASSWORD must contain at least 12 characters.");
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role ROLE_ADMIN not found"));
        User legacyAdmin = userRepository.findByUsername("admin").orElse(null);
        if (legacyAdmin != null && passwordEncoder.matches("admin123", legacyAdmin.getPassword())) {
            if (configured) {
                legacyAdmin.setUsername(adminUsername);
                legacyAdmin.setEmail(adminEmail);
                legacyAdmin.setPassword(passwordEncoder.encode(adminPassword));
                legacyAdmin.setEnabled(true);
                legacyAdmin.setRoles(Set.of(adminRole));
                userRepository.save(legacyAdmin);
                log.warn("Replaced the insecure default admin credentials with configured credentials");
            } else {
                legacyAdmin.setEnabled(false);
                userRepository.save(legacyAdmin);
                log.warn("Disabled the insecure default admin account; configure APP_ADMIN_* to create an administrator");
            }
            return;
        }

        if (!configured) {
            log.info("Admin account was not seeded; configure APP_ADMIN_USERNAME, APP_ADMIN_EMAIL, and APP_ADMIN_PASSWORD to create one.");
            return;
        }
        if (userRepository.existsByUsername(adminUsername) || userRepository.existsByEmail(adminEmail)) {
            log.info("Configured admin account already exists");
            return;
        }

        User adminUser = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(adminUser);
        log.info("Configured admin account created");
    }
}
