package com.jewellery.ProjWEB.mail;

public interface EmailService {

    void sendVerificationEmail(String to, String username, String token);

    void sendPasswordResetEmail(String to, String username, String token, String originUrl);
}
