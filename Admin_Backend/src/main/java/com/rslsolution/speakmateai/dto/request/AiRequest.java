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
public class AiRequest {

	@NotBlank(message = "Prompt is required")
	private String prompt;

	public String getPrompt() { return prompt; }
	public void setPrompt(String prompt) { this.prompt = prompt; }

	public static AiRequestBuilder builder() {
		return new AiRequestBuilder();
	}

	public static class AiRequestBuilder {
		private String prompt;

		public AiRequestBuilder prompt(String prompt) { this.prompt = prompt; return this; }

		public AiRequest build() {
            AiRequest obj = new AiRequest();
            obj.setPrompt(prompt);
            return obj;
        }
	}
}