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

	private Object estimatedDuration; // in minutes (accepts number or string)

	private Object xpReward;

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public String getDifficulty() { return difficulty; }
	public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

	public Integer getEstimatedDuration() {
		if (estimatedDuration == null) return 5;
		if (estimatedDuration instanceof Number) return ((Number) estimatedDuration).intValue();
		try {
			return Integer.parseInt(estimatedDuration.toString().replaceAll("\\D", ""));
		} catch (Exception e) {
			return 5;
		}
	}
	public void setEstimatedDuration(Object estimatedDuration) { this.estimatedDuration = estimatedDuration; }

	public Integer getXpReward() {
		if (xpReward == null) return 10;
		if (xpReward instanceof Number) return ((Number) xpReward).intValue();
		try {
			return Integer.parseInt(xpReward.toString().replaceAll("\\D", ""));
		} catch (Exception e) {
			return 10;
		}
	}
	public void setXpReward(Object xpReward) { this.xpReward = xpReward; }
}
