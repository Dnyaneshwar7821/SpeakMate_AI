package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Message is required")
	private String message;

	private Boolean isRead;

	private Long entityId;

	private String entityType;

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

	public static NotificationRequestBuilder builder() {
		return new NotificationRequestBuilder();
	}

	public static class NotificationRequestBuilder {
		private String title;
		private String message;
		private Boolean isRead;
		private Long entityId;
		private String entityType;

		public NotificationRequestBuilder title(String title) { this.title = title; return this; }
		public NotificationRequestBuilder message(String message) { this.message = message; return this; }
		public NotificationRequestBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
		public NotificationRequestBuilder entityId(Long entityId) { this.entityId = entityId; return this; }
		public NotificationRequestBuilder entityType(String entityType) { this.entityType = entityType; return this; }

		public NotificationRequest build() {
            NotificationRequest obj = new NotificationRequest();
            obj.setTitle(title);
            obj.setMessage(message);
            obj.setIsRead(isRead);
            obj.setEntityId(entityId);
            obj.setEntityType(entityType);
            return obj;
        }
	}
}