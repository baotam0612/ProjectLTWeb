package com.jewellery.ProjWEB.user.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        /**
         * Loads user details from the application's `User` entity and maps roles
         * to Spring Security `GrantedAuthority` instances.
         *
         * This is used by the authentication provider and the JWT filter when
         * validating tokens and building security context.
         */

        private final UserRepository userRepository;

        @Override
        @Transactional
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // Load user entity from persistence by username
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with username: " + username));

                // Map application Role entities to Spring Security GrantedAuthority
                List<GrantedAuthority> authorities = user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                                .collect(Collectors.toList());

                // Build and return a Spring Security UserDetails object containing
                // username, password, enabled flag and granted authorities used by the framework
                return new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPassword(),
                                user.isEnabled(),
                                true, // accountNonExpired
                                true, // credentialsNonExpired
                                true, // accountNonLocked
                                authorities);
        }
}
