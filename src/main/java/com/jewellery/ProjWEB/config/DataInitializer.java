package com.jewellery.ProjWEB.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.jewellery.ProjWEB.user.entity.Role;
import com.jewellery.ProjWEB.user.entity.Role.ERole;
import com.jewellery.ProjWEB.user.repository.RoleRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRoles();
    }

    private void seedRoles() {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(new Role(eRole));
                log.info("Seeded role: {}", eRole);
            }
        }
    }
}
