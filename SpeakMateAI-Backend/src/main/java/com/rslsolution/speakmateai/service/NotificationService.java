package com.rslsolution.speakmateai.service;

import java.util.List;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.NotificationType;

public interface NotificationService {

	NotificationResponse createNotification(NotificationRequest request);

	List<NotificationResponse> getAllNotifications();

	NotificationResponse getNotificationById(Long id);

	List<NotificationResponse> getUnreadNotifications();

	NotificationResponse markAsRead(Long id);

	void markAllRead();

	void deleteNotificationById(Long id);

	NotificationResponse createSystemNotification(User user, String title, String message);

	default NotificationResponse createSystemNotification(Student user, String title, String message) {
		return createSystemNotification((User) user, title, message);
	}

	NotificationResponse sendNotification(String recipientEmail, String title, String message, NotificationType type);

	NotificationResponse sendNotification(String recipientEmail, String title, String message, NotificationType type, Long entityId, String entityType);

	void notifyAdmins(String title, String message, NotificationType type);

	void notifyAdmins(String title, String message, NotificationType type, Long entityId, String entityType);

	void notifySchoolAdmins(Long schoolId, String title, String message, NotificationType type, Long entityId, String entityType);

	SseEmitter subscribeToStream(String email);

	void clearAllNotifications();

	long countUnread();

}