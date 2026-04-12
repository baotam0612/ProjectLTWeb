package com.jewellery.ProjWEB.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
}
