package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

	private Long id;

	private String title;

	private String message;

	private Boolean isRead;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public Boolean getIsRead() { return isRead; }
	public void setIsRead(Boolean isRead) { this.isRead = isRead; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static NotificationResponseBuilder builder() {
		return new NotificationResponseBuilder();
	}

	public static class NotificationResponseBuilder {
		private Long id;
		private String title;
		private String message;
		private Boolean isRead;
		private LocalDateTime createdAt;

		public NotificationResponseBuilder id(Long id) { this.id = id; return this; }
		public NotificationResponseBuilder title(String title) { this.title = title; return this; }
		public NotificationResponseBuilder message(String message) { this.message = message; return this; }
		public NotificationResponseBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
		public NotificationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public NotificationResponse build() {
			return new NotificationResponse(id, title, message, isRead, createdAt);
		}
	}
}