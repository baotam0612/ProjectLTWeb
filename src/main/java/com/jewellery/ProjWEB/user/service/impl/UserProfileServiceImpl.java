package com.jewellery.ProjWEB.user.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.jewellery.ProjWEB.user.service.UserProfileService;
import com.jewellery.ProjWEB.user.repository.UserRepository;
import com.jewellery.ProjWEB.user.repository.AccountRepository;
import com.jewellery.ProjWEB.user.dto.UpdateProfileRequest;
import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.user.entity.User;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public AccountEntity updateProfile(String username, UpdateProfileRequest request) {
        // Find the application user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Get or create associated AccountEntity
        AccountEntity account = user.getAccount();
        if (account == null) {
            account = new AccountEntity();
            // Copy basic identity fields from User into AccountEntity where appropriate
            account.setUser(user);
            account.setUsername(user.getUsername());
            account.setEmail(user.getEmail());
        }

        // Apply updates from request if provided
        if (request.getFullName() != null) {
            account.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            account.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            account.setAddress(request.getAddress());
        }

        // Persist account and ensure the relation is set on User
        AccountEntity saved = accountRepository.save(account);
        user.setAccount(saved);
        userRepository.save(user);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public AccountEntity getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getAccount();
    }
}
