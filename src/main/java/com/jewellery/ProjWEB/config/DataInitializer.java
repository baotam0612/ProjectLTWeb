package com.jewellery.ProjWEB.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        if (userRepository.existsByUsername("admin")) {
            log.info("Admin user already exists");
            return;
        }

        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role ROLE_ADMIN not found"));

        User adminUser = User.builder()
                .username("admin")
                .email("admin@jewellery.com")
                .password(passwordEncoder.encode("admin123"))
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(adminUser);
        log.info("Default admin user created: admin@jewellery.com");
    }
}
