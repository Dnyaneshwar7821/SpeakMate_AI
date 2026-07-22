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

}