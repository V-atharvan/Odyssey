package com.odyssey.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@odyssey.com}")
    private String fromEmail;

    @Async
    public void sendVerificationOtp(String to, String otp) {
        String subject = "Odyssey - Verify Your Email";
        String content = "Your verification code is: " + otp + ". It will expire in 5 minutes.";
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.info("OTP [ {} ] sent successfully via Spring Mail to {}", otp, to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}. For development, your OTP is: {}", 
                    to, e.getMessage(), otp);
        }
    }

    @Async
    public void sendProjectApplicationAlert(String to, String companyName, String studentName, String projectTitle) {
        String subject = "New Application Received - " + projectTitle;
        String heading = "New Project Application";
        String description = String.format("Hi %s,<br><br>Student <strong>%s</strong> has applied to your project <strong>%s</strong>.<br>Review their pitch and academic profile to schedule interviews or assign the project.",
                companyName, studentName, projectTitle);
        String htmlContent = getHtmlTemplate(heading, description, "Review Applicants", "http://localhost:5173/dashboard");
        sendHtmlMessage(to, subject, htmlContent);
    }

    @Async
    public void sendProjectAssignmentAlert(String to, String studentName, String projectTitle, String companyName) {
        String subject = "Congratulations! Project Assigned - " + projectTitle;
        String heading = "Project Assigned 🎉";
        String description = String.format("Hi %s,<br><br>Exciting news! <strong>%s</strong> has officially assigned you to their project <strong>%s</strong>.<br>Log in to your dashboard to review tasks, start collaboration, and track your milestone payments.",
                studentName, companyName, projectTitle);
        String htmlContent = getHtmlTemplate(heading, description, "Go to Dashboard", "http://localhost:5173/dashboard");
        sendHtmlMessage(to, subject, htmlContent);
    }

    @Async
    public void sendVerificationAlert(String to, String fullName, String role, boolean approved) {
        String subject = approved ? "Account Verified - Odyssey" : "Account Verification Update - Odyssey";
        String heading = approved ? "Account Verified! ✨" : "Account Verification Update";
        String statusText = approved ? "approved and fully verified" : "not approved at this time";
        String description = String.format("Hi %s,<br><br>Your Odyssey account registration as a <strong>%s</strong> has been <strong>%s</strong> by the platform administrator.<br>" +
                (approved ? "You now have full access to explore company partnerships, assign student projects, and manage talent on the platform." : "Please contact support for more details regarding your registration status."),
                fullName, role, statusText);
        String htmlContent = getHtmlTemplate(heading, description, approved ? "Log in Now" : "Contact Support", approved ? "http://localhost:5173/login" : "mailto:support@odyssey.com");
        sendHtmlMessage(to, subject, htmlContent);
    }

    private void sendHtmlMessage(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("HTML Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    private String getHtmlTemplate(String heading, String description, String ctaText, String ctaUrl) {
        String ctaButtonHtml = "";
        if (ctaText != null && ctaUrl != null) {
            ctaButtonHtml = "<a href=\"" + ctaUrl + "\" class=\"btn\">" + ctaText + "</a>";
        }

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <style>\n" +
                "        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; color: #333333; }\n" +
                "        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2f6; }\n" +
                "        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 35px 20px; text-align: center; color: #ffffff; }\n" +
                "        .logo { font-size: 26px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }\n" +
                "        .content { padding: 40px 30px; line-height: 1.6; }\n" +
                "        .title { font-size: 22px; font-weight: 700; color: #1e1b4b; margin-top: 0; margin-bottom: 20px; }\n" +
                "        .btn { display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); transition: all 0.3s ease; }\n" +
                "        .footer { background-color: #f9fafb; padding: 25px 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <p class=\"logo\">🚀 ODYSSEY</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <h1 class=\"title\">" + heading + "</h1>\n" +
                "            <p style=\"font-size: 16px; color: #4b5563; margin-bottom: 20px;\">" + description + "</p>\n" +
                "            " + ctaButtonHtml + "\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            This email was sent by the Odyssey Talent Platform.<br>\n" +
                "            © 2026 Odyssey Inc. Built with ❤️ for the future of student employment.\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
