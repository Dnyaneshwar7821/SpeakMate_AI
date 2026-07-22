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
public class SpeakingStartRequest {

	@NotBlank(message = "Scenario is required")
	private String scenario;

	private String difficulty; // Beginner / Intermediate / Advanced

	private Integer estimatedDuration; // in minutes

	private Integer xpReward;

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public String getDifficulty() { return difficulty; }
	public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

	public Integer getEstimatedDuration() { return estimatedDuration; }
	public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }

	public Integer getXpReward() { return xpReward; }
	public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

	public static SpeakingStartRequestBuilder builder() {
		return new SpeakingStartRequestBuilder();
	}

	public static class SpeakingStartRequestBuilder {
		private String scenario;
		private String difficulty;
		private Integer estimatedDuration;
		private Integer xpReward;

		public SpeakingStartRequestBuilder scenario(String scenario) { this.scenario = scenario; return this; }
		public SpeakingStartRequestBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
		public SpeakingStartRequestBuilder estimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; return this; }
		public SpeakingStartRequestBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }

		public SpeakingStartRequest build() {
			return new SpeakingStartRequest(scenario, difficulty, estimatedDuration, xpReward);
		}
	}
}
