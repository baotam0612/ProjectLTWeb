package com.jewellery.ProjWEB.user.dto;

import lombok.Data;

import jakarta.validation.constraints.Size;

@Data
public class UpdateProfileRequest {

    // Full name to display on orders and invoices
    @Size(max = 100)
    private String fullName;

    // Phone number used for contact and delivery
    @Size(max = 50)
    private String phoneNumber;

    // Shipping address for deliveries
    @Size(max = 255)
    private String address;
}
