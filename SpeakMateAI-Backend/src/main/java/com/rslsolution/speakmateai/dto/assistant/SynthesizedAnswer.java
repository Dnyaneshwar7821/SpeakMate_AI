package com.rslsolution.speakmateai.dto.assistant;

import java.util.List;

import com.rslsolution.speakmateai.dto.assistant.AssistantResponse.ChartData;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse.StatCard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Intermediate JSON produced by the Groq answer synthesizer. The service maps it
 * into an {@link AssistantResponse} and attaches deterministic navigation suggestions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SynthesizedAnswer {

	private String markdown;

	private List<StatCard> stats;

	private ChartData chart;

	/**
	 * Whether this answer would benefit from a deep-link to the full analytics /
	 * insights page. Decided by the LLM per question; when null/false the service
	 * attaches no analytics deep-link suggestions.
	 */
	private Boolean suggestDeepLink;
}
