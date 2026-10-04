package com.jewellery.ProjWEB.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.home.url}")
    private String homeUrl;

    @Override
    public void sendVerificationEmail(String to, String username, String token) {
        String verificationUrl = UriComponentsBuilder.fromUriString(trimTrailingSlash(frontendUrl))
                .path("/admin/verify-email")
                .fragment("token=" + token)
                .build()
                .encode()
                .toUriString();

        String content = """
                <html><body style="font-family:Arial,sans-serif;color:#333">
                  <h2>Hello %s,</h2>
                  <p>Thanks for registering. Confirm your email address using the button below.</p>
                  <p><a href="%s" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:5px">Confirm email</a></p>
                  <p>This link expires in 24 hours. If you did not create this account, ignore this message.</p>
                </body></html>
                """.formatted(escapeHtml(username), verificationUrl);

        sendHtmlEmail(to, "Confirm your account", content);
    }

    @Override
    public void sendPasswordResetEmail(String to, String username, String token) {
        String resetUrl = UriComponentsBuilder.fromUriString(trimTrailingSlash(homeUrl))
                .path("/reset.html")
                .fragment("token=" + token)
                .build()
                .encode()
                .toUriString();

        String content = """
                <html><body style="font-family:Arial,sans-serif;color:#333">
                  <h2>Hello %s,</h2>
                  <p>We received a request to reset your password.</p>
                  <p><a href="%s" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:5px">Reset password</a></p>
                  <p>This link expires in 30 minutes. If you did not request a reset, ignore this message.</p>
                </body></html>
                """.formatted(escapeHtml(username), resetUrl);

        sendHtmlEmail(to, "Password reset request", content);
    }

    private void sendHtmlEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new IllegalStateException("Failed to send email", e);
        }
    }

    private String trimTrailingSlash(String url) {
        return url.replaceAll("/+$", "");
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
