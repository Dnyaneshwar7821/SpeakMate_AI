package com.rslsolution.speakmateai.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.Notification;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.NotificationType;
import com.rslsolution.speakmateai.exception.NotificationNotFoundException;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

	private final NotificationRepository notificationRepository;
	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final AdminRepository adminRepository;

	// In-memory SSE connections by user email
	private final Map<String, CopyOnWriteArrayList<SseEmitter>> sseEmitters = new ConcurrentHashMap<>();

	public NotificationServiceImpl(NotificationRepository notificationRepository,
			StudentRepository studentRepository,
			UserRepository userRepository,
			AdminRepository adminRepository) {
		this.notificationRepository = notificationRepository;
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
		this.adminRepository = adminRepository;
	}

	private String getCurrentEmail() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getName() == null) {
			return null;
		}
		return authentication.getName();
	}

	private NotificationResponse mapToResponse(Notification notification) {
		return NotificationResponse.builder()
				.id(notification.getId())
				.title(notification.getTitle())
				.message(notification.getMessage())
				.isRead(notification.getIsRead())
				.createdAt(notification.getCreatedAt())
				.notificationType(notification.getNotificationType() != null ? notification.getNotificationType() : NotificationType.SYSTEM_EVENT)
				.entityId(notification.getEntityId())
				.entityType(notification.getEntityType())
				.build();
	}

	private void pushToSse(String email, NotificationResponse response) {
		if (email == null) return;
		CopyOnWriteArrayList<SseEmitter> emitters = sseEmitters.get(email);
		if (emitters != null && !emitters.isEmpty()) {
			for (SseEmitter emitter : emitters) {
				try {
					emitter.send(SseEmitter.event()
							.name("NOTIFICATION")
							.data(response));
				} catch (IOException | IllegalStateException e) {
					logger.debug("Removing dead SSE emitter for email: {}", email);
					emitters.remove(emitter);
				}
			}
		}
	}

	@Override
	public NotificationResponse createNotification(NotificationRequest request) {
		String email = getCurrentEmail();
		User user = email != null ? userRepository.findByEmail(email).orElse(null) : null;

		Notification notification = Notification.builder()
				.user(user)
				.recipientEmail(email)
				.title(request.getTitle())
				.message(request.getMessage())
				.isRead(request.getIsRead() != null ? request.getIsRead() : false)
				.notificationType(NotificationType.SYSTEM_EVENT)
				.entityId(request.getEntityId())
				.entityType(request.getEntityType())
				.build();

		Notification savedNotification = notificationRepository.save(notification);
		NotificationResponse response = mapToResponse(savedNotification);
		pushToSse(email, response);
		return response;
	}

	@Override
	public List<NotificationResponse> getAllNotifications() {
		String email = getCurrentEmail();
		if (email == null) {
			return List.of();
		}

		List<Notification> notifications = notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);

		if (notifications.isEmpty()) {
			// Seed a helpful welcome notification for the user
			Notification welcomeNotification = Notification.builder()
					.recipientEmail(email)
					.title("Welcome to SpeakMateAI!")
					.message("Stay connected with real-time updates across classes, teachers, and system activities.")
					.isRead(false)
					.notificationType(NotificationType.SYSTEM_EVENT)
					.build();
			notificationRepository.save(welcomeNotification);
			notifications = notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
		}

		return notifications.stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public NotificationResponse getNotificationById(Long id) {
		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
		return mapToResponse(notification);
	}

	@Override
	public List<NotificationResponse> getUnreadNotifications() {
		String email = getCurrentEmail();
		if (email == null) {
			return List.of();
		}

		List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadFalse(email);
		return unread.stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public NotificationResponse markAsRead(Long id) {
		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
		notification.setIsRead(true);
		Notification updatedNotification = notificationRepository.save(notification);
		return mapToResponse(updatedNotification);
	}

	@Override
	public void markAllRead() {
		String email = getCurrentEmail();
		if (email == null) return;
		List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadFalse(email);
		unread.forEach(n -> n.setIsRead(true));
		notificationRepository.saveAll(unread);
	}

	@Override
	public void deleteNotificationById(Long id) {
		Notification notification = notificationRepository.findById(id)
				.orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
		notificationRepository.delete(notification);
	}

	@Override
	public NotificationResponse createSystemNotification(Student user, String title, String message) {
		return sendNotification(user.getEmail(), title, message, NotificationType.SYSTEM_EVENT);
	}

	@Override
	public NotificationResponse createSystemNotification(User user, String title, String message) {
		return sendNotification(user.getEmail(), title, message, NotificationType.SYSTEM_EVENT);
	}

	@Override
	public NotificationResponse sendNotification(String recipientEmail, String title, String message, NotificationType type) {
		return sendNotification(recipientEmail, title, message, type, null, null);
	}

	@Override
	public NotificationResponse sendNotification(String recipientEmail, String title, String message, NotificationType type, Long entityId, String entityType) {
		User user = userRepository.findByEmail(recipientEmail).orElse(null);

		Notification notification = Notification.builder()
				.recipientEmail(recipientEmail)
				.user(user)
				.title(title)
				.message(message)
				.isRead(false)
				.notificationType(type != null ? type : NotificationType.SYSTEM_EVENT)
				.entityId(entityId)
				.entityType(entityType)
				.build();

		Notification saved = notificationRepository.save(notification);
		NotificationResponse response = mapToResponse(saved);
		pushToSse(recipientEmail, response);
		return response;
	}

	@Override
	public void notifyAdmins(String title, String message, NotificationType type) {
		notifyAdmins(title, message, type, null, null);
	}

	@Override
	public void notifyAdmins(String title, String message, NotificationType type, Long entityId, String entityType) {
		// Notify Platform Admins
		List<Admin> admins = adminRepository.findAll();
		for (Admin admin : admins) {
			sendNotification(admin.getEmail(), title, message, type, entityId, entityType);
		}

		// Also notify any users with SUPER_ADMIN / ADMIN roles in users table
		List<User> userAdmins = userRepository.findByRole(com.rslsolution.speakmateai.enums.Role.SUPER_ADMIN);
		for (User adminUser : userAdmins) {
			if (adminUser.getEmail() != null) {
				sendNotification(adminUser.getEmail(), title, message, type, entityId, entityType);
			}
		}
	}

	@Override
	public void notifySchoolAdmins(Long schoolId, String title, String message, NotificationType type, Long entityId, String entityType) {
		if (schoolId == null) return;
		List<User> schoolAdmins = userRepository.findBySchoolIdAndRole(schoolId, com.rslsolution.speakmateai.enums.Role.SCHOOL_ADMIN);
		if (schoolAdmins != null) {
			for (User admin : schoolAdmins) {
				if (admin.getEmail() != null && !admin.getEmail().isBlank()) {
					sendNotification(admin.getEmail(), title, message, type, entityId, entityType);
				}
			}
		}
	}

	@Override
	public SseEmitter subscribeToStream(String email) {
		// 30 minute timeout
		SseEmitter emitter = new SseEmitter(1800000L);

		CopyOnWriteArrayList<SseEmitter> list = sseEmitters.computeIfAbsent(email, k -> new CopyOnWriteArrayList<>());
		list.add(emitter);

		emitter.onCompletion(() -> list.remove(emitter));
		emitter.onTimeout(() -> list.remove(emitter));
		emitter.onError(e -> list.remove(emitter));

		try {
			emitter.send(SseEmitter.event()
					.name("CONNECTED")
					.data("Connected to SpeakMate AI notification stream"));
		} catch (IOException e) {
			logger.warn("Failed to send initial SSE connected event: {}", e.getMessage());
			list.remove(emitter);
		}

		return emitter;
	}

	@Override
	public void clearAllNotifications() {
		String email = getCurrentEmail();
		if (email == null) return;
		List<Notification> all = notificationRepository.findByRecipientEmail(email);
		notificationRepository.deleteAll(all);
	}

	@Override
	public long countUnread() {
		String email = getCurrentEmail();
		if (email == null) return 0L;
		return notificationRepository.countByRecipientEmailAndIsReadFalse(email);
	}
}