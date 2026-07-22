package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRenameRequest {

	@NotBlank(message = "Title is required")
	private String title;

}
