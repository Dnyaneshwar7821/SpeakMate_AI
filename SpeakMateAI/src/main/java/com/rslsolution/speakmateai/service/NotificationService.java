package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.entity.User;

public interface NotificationService {

	NotificationResponse createNotification(NotificationRequest request);

	List<NotificationResponse> getAllNotifications();

	NotificationResponse getNotificationById(Long id);

	List<NotificationResponse> getUnreadNotifications();

	NotificationResponse markAsRead(Long id);

	void markAllRead();

	void deleteNotificationById(Long id);

	NotificationResponse createSystemNotification(User user, String title, String message);

	void clearAllNotifications();

	long countUnread();

}