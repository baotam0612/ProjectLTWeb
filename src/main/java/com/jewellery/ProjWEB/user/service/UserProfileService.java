package com.jewellery.ProjWEB.user.service;

import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.user.dto.UpdateProfileRequest;

public interface UserProfileService {

    /**
     * Update the profile (account) information for the given username.
     * Returns the saved AccountEntity.
     */
    AccountEntity updateProfile(String username, UpdateProfileRequest request);

    /**
     * Retrieve the profile/account for the given username, or null if none.
     */
    AccountEntity getProfile(String username);
}
