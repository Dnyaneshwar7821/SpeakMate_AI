package com.rslsolution.speakmateai.dto.assistant;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for {@code POST /api/assistant/message}.
 * Rendered by the frontend widget as markdown + stat cards + optional mini chart
 * + deep-link navigation suggestions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantResponse {

	private String markdown;

	private String intent;

	/** True when the question was out of the caller's role scope (graceful denial, no data leak). */
	private boolean accessDenied;

	private String sessionId;

	private List<StatCard> stats;

	private ChartData chart;

	private List<Suggestion> suggestions;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class StatCard {
		private String label;
		private String value;
		private String delta;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ChartData {
		private String type;
		private String title;
		private List<String> labels;
		private List<Dataset> datasets;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Dataset {
		private String label;
		private List<Double> data;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Suggestion {
		private String label;
		private String route;
		private String targetRole;
	}
}
