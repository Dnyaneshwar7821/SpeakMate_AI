package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.entity.Student;

public interface NotificationService {

	NotificationResponse createNotification(NotificationRequest request);

	List<NotificationResponse> getAllNotifications();

	NotificationResponse getNotificationById(Long id);

	List<NotificationResponse> getUnreadNotifications();

	NotificationResponse markAsRead(Long id);

	void markAllRead();

	void deleteNotificationById(Long id);

	NotificationResponse createSystemNotification(Student user, String title, String message);

	NotificationResponse createSystemNotification(com.rslsolution.speakmateai.entity.User user, String title, String message);

	NotificationResponse sendNotification(String recipientEmail, String title, String message, com.rslsolution.speakmateai.enums.NotificationType type);

	NotificationResponse sendNotification(String recipientEmail, String title, String message, com.rslsolution.speakmateai.enums.NotificationType type, Long entityId, String entityType);

	void notifyAdmins(String title, String message, com.rslsolution.speakmateai.enums.NotificationType type);

	void notifyAdmins(String title, String message, com.rslsolution.speakmateai.enums.NotificationType type, Long entityId, String entityType);

	void notifySchoolAdmins(Long schoolId, String title, String message, com.rslsolution.speakmateai.enums.NotificationType type, Long entityId, String entityType);

	org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribeToStream(String email);

	void clearAllNotifications();

	long countUnread();

}