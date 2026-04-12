package com.jewellery.ProjWEB.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;

import com.jewellery.ProjWEB.user.service.UserProfileService;
import com.jewellery.ProjWEB.user.dto.UpdateProfileRequest;
import com.jewellery.ProjWEB.user.dto.ProfileResponse;
import com.jewellery.ProjWEB.entity.AccountEntity;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Get the current authenticated user's profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        // Defensive check: Authentication may be null when no valid principal is present
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        AccountEntity account = userProfileService.getProfile(username);
        ProfileResponse resp = map(account, username);
        return ResponseEntity.ok(resp);
    }

    /**
     * Update the current authenticated user's profile (address, phone, fullName).
     */
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                         Authentication authentication) {
        // Defensive check to avoid NPE when authentication is missing
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        AccountEntity account = userProfileService.updateProfile(username, request);
        ProfileResponse resp = map(account, username);
        return ResponseEntity.ok(resp);
    }

    private ProfileResponse map(AccountEntity account, String username) {
        if (account == null) {
            return new ProfileResponse(username, null, null, null, null);
        }
        return new ProfileResponse(
                username,
                account.getEmail(),
                account.getFullName(),
                account.getPhoneNumber(),
                account.getAddress()
        );
    }
}
