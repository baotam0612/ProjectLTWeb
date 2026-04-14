package com.jewellery.ProjWEB.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.backend.url}")
    private String backendUrl;

    @Override
    public void sendVerificationEmail(String to, String username, String token) {
        String subject = "Mã xác nhận tài khoản của bạn";
        String content = """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #4CAF50; text-align: center;">Chào mừng %s!</h2>
                        <p style="font-size: 16px;">Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã xác nhận bên dưới để kích hoạt tài khoản của bạn:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="background-color: #ffffff; border: 2px dashed #4CAF50; color: #4CAF50;
                                         padding: 15px 30px; border-radius: 5px; font-size: 32px; font-weight: bold;
                                         letter-spacing: 5px;">
                                %s
                            </span>
                        </div>
                        <p style="color: #666; font-size: 14px; text-align: center;">Mã này sẽ hết hạn trong 24 giờ.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #888; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    </div>
                </body>
                </html>
                """.formatted(username, token);

        sendHtmlEmail(to, subject, content);
    }

    @Override
    public void sendPasswordResetEmail(String to, String username, String token, String originUrl) {
        String subject = "Yêu cầu đặt lại mật khẩu";
        String baseUrl = (originUrl != null && !originUrl.isBlank()) ? originUrl : frontendUrl;
        String resetUrl = baseUrl + "/reset.html?token=" + token;
        String content = """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2196F3;">Xin chào, %s!</h2>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s"
                           style="background-color: #2196F3; color: white; padding: 14px 28px;
                                  text-decoration: none; border-radius: 5px; font-size: 16px;">
                            Đặt lại mật khẩu
                        </a>
                    </div>
                    <p style="color: #888;">Link có hiệu lực trong 30 phút.</p>
                    <p style="color: #888;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </body>
                </html>
                """.formatted(username, resetUrl);

        sendHtmlEmail(to, subject, content);
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
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
