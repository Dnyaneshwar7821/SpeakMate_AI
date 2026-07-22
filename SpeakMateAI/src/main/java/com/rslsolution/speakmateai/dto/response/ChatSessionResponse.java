package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionResponse {

	private Long id;
	private String mode;
	private String title;
	private int messageCount;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

}
