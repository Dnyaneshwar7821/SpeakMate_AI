package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.NotificationType;

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

	private NotificationType notificationType;

	private Long entityId;

	private String entityType;

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

	public NotificationType getNotificationType() { return notificationType; }
	public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }

	public Long getEntityId() { return entityId; }
	public void setEntityId(Long entityId) { this.entityId = entityId; }

	public String getEntityType() { return entityType; }
	public void setEntityType(String entityType) { this.entityType = entityType; }

	public static NotificationResponseBuilder builder() {
		return new NotificationResponseBuilder();
	}

	public static class NotificationResponseBuilder {
		private Long id;
		private String title;
		private String message;
		private Boolean isRead;
		private LocalDateTime createdAt;
		private NotificationType notificationType;
		private Long entityId;
		private String entityType;

		public NotificationResponseBuilder id(Long id) { this.id = id; return this; }
		public NotificationResponseBuilder title(String title) { this.title = title; return this; }
		public NotificationResponseBuilder message(String message) { this.message = message; return this; }
		public NotificationResponseBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
		public NotificationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public NotificationResponseBuilder notificationType(NotificationType notificationType) { this.notificationType = notificationType; return this; }
		public NotificationResponseBuilder entityId(Long entityId) { this.entityId = entityId; return this; }
		public NotificationResponseBuilder entityType(String entityType) { this.entityType = entityType; return this; }

		public NotificationResponse build() {
            NotificationResponse obj = new NotificationResponse();
            obj.setId(id);
            obj.setTitle(title);
            obj.setMessage(message);
            obj.setIsRead(isRead);
            obj.setCreatedAt(createdAt);
            obj.setNotificationType(notificationType != null ? notificationType : NotificationType.SYSTEM_EVENT);
            obj.setEntityId(entityId);
            obj.setEntityType(entityType);
            return obj;
        }
	}
}