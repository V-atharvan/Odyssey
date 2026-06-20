package com.odyssey.dto.response;

import com.odyssey.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;
}
