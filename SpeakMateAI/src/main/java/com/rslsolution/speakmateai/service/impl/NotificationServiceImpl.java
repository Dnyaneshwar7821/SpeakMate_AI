package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.entity.Notification;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.NotificationNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	@Override
	public NotificationResponse createNotification(NotificationRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		Notification notification = Notification.builder().user(user).title(request.getTitle())
				.message(request.getMessage()).isRead(request.getIsRead()).build();

		Notification savedNotification = notificationRepository.save(notification);

		return NotificationResponse.builder().id(savedNotification.getId()).title(savedNotification.getTitle())
				.message(savedNotification.getMessage()).isRead(savedNotification.getIsRead())
				.createdAt(savedNotification.getCreatedAt()).build();
	}

	@Override
	public List<NotificationResponse> getAllNotifications() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

		if (notifications.isEmpty()) {
			List<Notification> sampleList = List.of(
				Notification.builder().user(user).title("Welcome to SpeakMateAI!").message("Start your journey today by completing your first speaking session.").isRead(false).build(),
				Notification.builder().user(user).title("Keep the Streak Alive").message("Don't forget to practice today to maintain your learning streak!").isRead(false).build(),
				Notification.builder().user(user).title("Vocabulary Reminder").message("Review your saved vocabulary words using the Flashcard module.").isRead(false).build()
			);
			notifications = notificationRepository.saveAll(sampleList);
			// Re-fetch sorted by creation date
			notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
		}

		return notifications.stream()
				.map(notification -> NotificationResponse.builder().id(notification.getId())
						.title(notification.getTitle()).message(notification.getMessage())
						.isRead(notification.getIsRead()).createdAt(notification.getCreatedAt()).build())
				.toList();
	}

	@Override
	public NotificationResponse getNotificationById(Long id) {

		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

		return NotificationResponse.builder().id(notification.getId()).title(notification.getTitle())
				.message(notification.getMessage()).isRead(notification.getIsRead())
				.createdAt(notification.getCreatedAt()).build();
	}

	@Override
	public List<NotificationResponse> getUnreadNotifications() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
		
		if (unread.isEmpty()) {
			// Trigger seeding if all are empty (both read and unread)
			List<Notification> all = notificationRepository.findByUser(user);
			if (all.isEmpty()) {
				getAllNotifications(); // This will trigger seeding
				unread = notificationRepository.findByUserAndIsReadFalse(user);
			}
		}

		return unread.stream()
				.map(notification -> NotificationResponse.builder().id(notification.getId())
						.title(notification.getTitle()).message(notification.getMessage())
						.isRead(notification.getIsRead()).createdAt(notification.getCreatedAt()).build())
				.toList();
	}

	@Override
	public NotificationResponse markAsRead(Long id) {

		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

		notification.setIsRead(true);

		Notification updatedNotification = notificationRepository.save(notification);

		return NotificationResponse.builder().id(updatedNotification.getId()).title(updatedNotification.getTitle())
				.message(updatedNotification.getMessage()).isRead(updatedNotification.getIsRead())
				.createdAt(updatedNotification.getCreatedAt()).build();
	}

	@Override
	public void markAllRead() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
		unread.forEach(n -> n.setIsRead(true));
		notificationRepository.saveAll(unread);
	}

	@Override
	public void deleteNotificationById(Long id) {

		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

		notificationRepository.delete(notification);
	}

	// ── System-triggered helper ─────────────────────────────────────────

	@Override
	public NotificationResponse createSystemNotification(User user, String title, String message) {
		Notification notification = Notification.builder()
				.user(user)
				.title(title)
				.message(message)
				.isRead(false)
				.build();
		Notification saved = notificationRepository.save(notification);
		return NotificationResponse.builder()
				.id(saved.getId())
				.title(saved.getTitle())
				.message(saved.getMessage())
				.isRead(saved.getIsRead())
				.createdAt(saved.getCreatedAt())
				.build();
	}

	@Override
	public void clearAllNotifications() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		List<Notification> all = notificationRepository.findByUser(user);
		notificationRepository.deleteAll(all);
	}

	@Override
	public long countUnread() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		return notificationRepository.countByUserAndIsReadFalse(user);
	}
}