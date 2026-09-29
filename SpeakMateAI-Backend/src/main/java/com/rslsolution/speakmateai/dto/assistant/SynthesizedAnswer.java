package com.rslsolution.speakmateai.dto.assistant;

import java.util.List;

import com.rslsolution.speakmateai.dto.assistant.AssistantResponse.ChartData;
import com.rslsolution.speakmateai.dto.assistant.AssistantResponse.StatCard;

/**
 * Intermediate JSON produced by the Groq answer synthesizer. The service maps it
 * into an {@link AssistantResponse} and attaches deterministic navigation suggestions.
 */
public class SynthesizedAnswer {

	private String markdown;
	private List<StatCard> stats;
	private ChartData chart;
	private Boolean suggestDeepLink;

	public SynthesizedAnswer() {
	}

	public SynthesizedAnswer(String markdown, List<StatCard> stats, ChartData chart, Boolean suggestDeepLink) {
		this.markdown = markdown;
		this.stats = stats;
		this.chart = chart;
		this.suggestDeepLink = suggestDeepLink;
	}

	public String getMarkdown() {
		return markdown;
	}

	public void setMarkdown(String markdown) {
		this.markdown = markdown;
	}

	public List<StatCard> getStats() {
		return stats;
	}

	public void setStats(List<StatCard> stats) {
		this.stats = stats;
	}

	public ChartData getChart() {
		return chart;
	}

	public void setChart(ChartData chart) {
		this.chart = chart;
	}

	public Boolean getSuggestDeepLink() {
		return suggestDeepLink;
	}

	public void setSuggestDeepLink(Boolean suggestDeepLink) {
		this.suggestDeepLink = suggestDeepLink;
	}

	public static Builder builder() {
		return new Builder();
	}

	public static class Builder {
		private String markdown;
		private List<StatCard> stats;
		private ChartData chart;
		private Boolean suggestDeepLink;

		public Builder markdown(String markdown) {
			this.markdown = markdown;
			return this;
		}

		public Builder stats(List<StatCard> stats) {
			this.stats = stats;
			return this;
		}

		public Builder chart(ChartData chart) {
			this.chart = chart;
			return this;
		}

		public Builder suggestDeepLink(Boolean suggestDeepLink) {
			this.suggestDeepLink = suggestDeepLink;
			return this;
		}

		public SynthesizedAnswer build() {
			return new SynthesizedAnswer(markdown, stats, chart, suggestDeepLink);
		}
	}
}
