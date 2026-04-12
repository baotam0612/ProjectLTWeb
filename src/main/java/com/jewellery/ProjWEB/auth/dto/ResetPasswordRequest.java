package com.jewellery.ProjWEB.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    /**
     * DTO carrying the reset token and new password data used to complete a password reset.
     */

    @NotBlank(message = "Token is required")
    // Password reset token sent to user by email
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    // New password the user wants to set (must be confirmed)
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    // Confirmation of the new password; server verifies equality with newPassword
    private String confirmPassword;
}
