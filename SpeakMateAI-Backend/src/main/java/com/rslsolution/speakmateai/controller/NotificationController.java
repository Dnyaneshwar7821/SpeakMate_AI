package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.NotificationRequest;
import com.rslsolution.speakmateai.dto.response.NotificationResponse;
import com.rslsolution.speakmateai.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

	private final NotificationService notificationService;
	private final com.rslsolution.speakmateai.util.JwtUtil jwtUtil;

	public NotificationController(NotificationService notificationService, com.rslsolution.speakmateai.util.JwtUtil jwtUtil) {
		this.notificationService = notificationService;
		this.jwtUtil = jwtUtil;
	}

	@GetMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
	public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamNotifications(
			@org.springframework.web.bind.annotation.RequestParam(required = false) String token,
			org.springframework.security.core.Authentication authentication) {
		String email = null;
		if (authentication != null && authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
			email = authentication.getName();
		} else if (token != null && !token.isBlank() && !"null".equals(token) && !"undefined".equals(token)) {
			try {
				email = jwtUtil.extractEmail(token);
			} catch (Exception ignored) {}
		}

		if (email == null) {
			org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
			emitter.complete();
			return emitter;
		}

		return notificationService.subscribeToStream(email);
	}

	@PostMapping("/create-notification")
	public NotificationResponse createNotification(@Valid @RequestBody NotificationRequest request) {

		return notificationService.createNotification(request);
	}

	@GetMapping("/get-all-notifications")
	public List<NotificationResponse> getAllNotifications() {

		return notificationService.getAllNotifications();
	}

	@GetMapping("/get-notification/{id}")
	public NotificationResponse getNotificationById(@PathVariable Long id) {

		return notificationService.getNotificationById(id);
	}

	@GetMapping("/get-unread-notifications")
	public List<NotificationResponse> getUnreadNotifications() {

		return notificationService.getUnreadNotifications();
	}

	@PutMapping("/mark-as-read/{id}")
	public NotificationResponse markAsRead(@PathVariable Long id) {

		return notificationService.markAsRead(id);
	}

	@PutMapping("/mark-all-read")
	public String markAllRead() {
		notificationService.markAllRead();
		return "All notifications marked as read.";
	}

	@DeleteMapping("/delete-notification/{id}")
	public String deleteNotificationById(@PathVariable Long id) {

		notificationService.deleteNotificationById(id);

		return "Notification deleted successfully.";
	}

	@DeleteMapping("/clear-all")
	public String clearAllNotifications() {
		notificationService.clearAllNotifications();
		return "All notifications cleared.";
	}

	@GetMapping("/count-unread")
	public long countUnread() {
		return notificationService.countUnread();
	}
}