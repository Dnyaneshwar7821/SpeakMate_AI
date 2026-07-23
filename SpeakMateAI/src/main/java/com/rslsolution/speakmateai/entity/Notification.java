package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String message;

	private Boolean isRead;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public Boolean getIsRead() { return isRead; }
	public void setIsRead(Boolean isRead) { this.isRead = isRead; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static NotificationBuilder builder() {
		return new NotificationBuilder();
	}

	public static class NotificationBuilder {
		private Long id;
		private User user;
		private String title;
		private String message;
		private Boolean isRead;
		private LocalDateTime createdAt;

		public NotificationBuilder id(Long id) { this.id = id; return this; }
		public NotificationBuilder user(User user) { this.user = user; return this; }
		public NotificationBuilder title(String title) { this.title = title; return this; }
		public NotificationBuilder message(String message) { this.message = message; return this; }
		public NotificationBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
		public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public Notification build() {
            Notification obj = new Notification();
            obj.setId(id);
            obj.setUser(user);
            obj.setTitle(title);
            obj.setMessage(message);
            obj.setIsRead(isRead);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}