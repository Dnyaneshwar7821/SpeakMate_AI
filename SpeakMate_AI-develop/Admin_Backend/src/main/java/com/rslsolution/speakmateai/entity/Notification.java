package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.NotificationType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = true)
	private Student student;

	@Column(name = "recipient_email")
	private String recipientEmail;

	@Enumerated(EnumType.STRING)
	@Column(name = "notification_type")
	private NotificationType notificationType;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String message;

	private Boolean isRead;

	@Column(name = "entity_id")
	private Long entityId;

	@Column(name = "entity_type")
	private String entityType;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		if (isRead == null) {
			isRead = false;
		}
		if (notificationType == null) {
			notificationType = NotificationType.SYSTEM_EVENT;
		}
		if (recipientEmail == null && student != null) {
			recipientEmail = student.getEmail();
		}
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Student getStudent() { return student; }
	public void setStudent(Student student) {
		this.student = student;
		if (student != null && this.recipientEmail == null) {
			this.recipientEmail = student.getEmail();
		}
	}

	public User getUser() { return student; }
	public void setUser(User user) {
		if (user instanceof Student s) {
			this.student = s;
		}
		if (user != null && this.recipientEmail == null) {
			this.recipientEmail = user.getEmail();
		}
	}

	public String getRecipientEmail() { return recipientEmail; }
	public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

	public NotificationType getNotificationType() { return notificationType; }
	public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public Boolean getIsRead() { return isRead; }
	public void setIsRead(Boolean isRead) { this.isRead = isRead; }

	public Long getEntityId() { return entityId; }
	public void setEntityId(Long entityId) { this.entityId = entityId; }

	public String getEntityType() { return entityType; }
	public void setEntityType(String entityType) { this.entityType = entityType; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static NotificationBuilder builder() {
		return new NotificationBuilder();
	}

	public static class NotificationBuilder {
		private Long id;
		private Student student;
		private String recipientEmail;
		private NotificationType notificationType;
		private String title;
		private String message;
		private Boolean isRead;
		private Long entityId;
		private String entityType;
		private LocalDateTime createdAt;

		public NotificationBuilder id(Long id) { this.id = id; return this; }
		public NotificationBuilder user(User user) {
			if (user instanceof Student s) {
				this.student = s;
			}
			if (user != null && this.recipientEmail == null) {
				this.recipientEmail = user.getEmail();
			}
			return this;
		}
		public NotificationBuilder student(Student student) {
			this.student = student;
			if (student != null && this.recipientEmail == null) {
				this.recipientEmail = student.getEmail();
			}
			return this;
		}
		public NotificationBuilder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
		public NotificationBuilder notificationType(NotificationType notificationType) { this.notificationType = notificationType; return this; }
		public NotificationBuilder title(String title) { this.title = title; return this; }
		public NotificationBuilder message(String message) { this.message = message; return this; }
		public NotificationBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
		public NotificationBuilder entityId(Long entityId) { this.entityId = entityId; return this; }
		public NotificationBuilder entityType(String entityType) { this.entityType = entityType; return this; }
		public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public Notification build() {
            Notification obj = new Notification();
            obj.setId(id);
            obj.setStudent(student);
            obj.setRecipientEmail(recipientEmail != null ? recipientEmail : (student != null ? student.getEmail() : null));
            obj.setNotificationType(notificationType != null ? notificationType : NotificationType.SYSTEM_EVENT);
            obj.setTitle(title);
            obj.setMessage(message);
            obj.setIsRead(isRead != null ? isRead : false);
            obj.setEntityId(entityId);
            obj.setEntityType(entityType);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}