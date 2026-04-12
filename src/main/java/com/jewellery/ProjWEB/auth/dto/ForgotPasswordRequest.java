package com.jewellery.ProjWEB.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    /**
     * DTO used to request a password reset email for the provided address.
     */

    // Email address for which a password reset should be initiated
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
