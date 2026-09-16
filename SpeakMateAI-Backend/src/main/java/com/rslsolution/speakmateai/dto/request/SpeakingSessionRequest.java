package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSessionRequest {

	@NotBlank(message = "Topic is required")
	private String topic;

	private String scenario;

	@NotBlank(message = "Transcript is required")
	private String transcript;

	@NotNull(message = "Duration is required")
	@Min(value = 1, message = "Duration must be greater than 0")
	private Integer duration;

	private Double overallScore;
	private Double score;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double fluencyScore;
	private Double pronunciationScore;
	private Integer xpEarned;
	private Integer dialogueTurns;
	private String feedback;
	private String vocabularyLearned;
	private String grammarCorrections;
	private String betterSentences;
	private String motivationalMessage;

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public String getTranscript() { return transcript; }
	public void setTranscript(String transcript) { this.transcript = transcript; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Double getOverallScore() { return overallScore; }
	public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

	public Double getScore() { return score; }
	public void setScore(Double score) { this.score = score; }

	public Double getGrammarScore() { return grammarScore; }
	public void setGrammarScore(Double grammarScore) { this.grammarScore = grammarScore; }

	public Double getVocabularyScore() { return vocabularyScore; }
	public void setVocabularyScore(Double vocabularyScore) { this.vocabularyScore = vocabularyScore; }

	public Double getFluencyScore() { return fluencyScore; }
	public void setFluencyScore(Double fluencyScore) { this.fluencyScore = fluencyScore; }

	public Double getPronunciationScore() { return pronunciationScore; }
	public void setPronunciationScore(Double pronunciationScore) { this.pronunciationScore = pronunciationScore; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public Integer getDialogueTurns() { return dialogueTurns; }
	public void setDialogueTurns(Integer dialogueTurns) { this.dialogueTurns = dialogueTurns; }

	public String getFeedback() { return feedback; }
	public void setFeedback(String feedback) { this.feedback = feedback; }

	public String getVocabularyLearned() { return vocabularyLearned; }
	public void setVocabularyLearned(String vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; }

	public String getGrammarCorrections() { return grammarCorrections; }
	public void setGrammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; }

	public String getBetterSentences() { return betterSentences; }
	public void setBetterSentences(String betterSentences) { this.betterSentences = betterSentences; }

	public String getMotivationalMessage() { return motivationalMessage; }
	public void setMotivationalMessage(String motivationalMessage) { this.motivationalMessage = motivationalMessage; }
}
