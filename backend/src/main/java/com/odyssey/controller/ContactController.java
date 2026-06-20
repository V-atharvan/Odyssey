package com.odyssey.controller;

import com.odyssey.dto.response.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContactController {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String message;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> sendMessage(@RequestBody ContactRequest request) {
        log.info("Received contact inquiry from {} <{}>", request.getName(), request.getEmail());
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo("v.atharvan@gmail.com");
            mailMessage.setSubject("New Contact Inquiry from " + request.getName());
            mailMessage.setText("You received a new message from Odyssey website contact form:\n\n" +
                    "Name: " + request.getName() + "\n" +
                    "Email: " + request.getEmail() + "\n\n" +
                    "Message:\n" + request.getMessage());

            log.info("Sending contact mail via SMTP from {} to v.atharvan@gmail.com", fromEmail);
            mailSender.send(mailMessage);
            log.info("Contact mail sent successfully!");
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully!", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }
}
