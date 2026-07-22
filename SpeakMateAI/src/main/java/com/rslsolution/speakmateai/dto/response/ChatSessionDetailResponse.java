package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDetailResponse {

	private Long id;
	private String mode;
	private String title;
	private LocalDateTime createdAt;
	private List<ChatMessageResponse> messages;

}
