package com.rslsolution.speakmateai.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conversation_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationFeedback {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private SpeakingSession session;

	@Column(columnDefinition = "TEXT")
	private String grammarCorrections;

	@Column(columnDefinition = "TEXT")
	private String betterSentences;

	@Column(columnDefinition = "TEXT")
	private String vocabularySuggestions;

	@Column(columnDefinition = "TEXT")
	private String summary;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public SpeakingSession getSession() { return session; }
	public void setSession(SpeakingSession session) { this.session = session; }

	public String getGrammarCorrections() { return grammarCorrections; }
	public void setGrammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; }

	public String getBetterSentences() { return betterSentences; }
	public void setBetterSentences(String betterSentences) { this.betterSentences = betterSentences; }

	public String getVocabularySuggestions() { return vocabularySuggestions; }
	public void setVocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; }

	public String getSummary() { return summary; }
	public void setSummary(String summary) { this.summary = summary; }

	public static ConversationFeedbackBuilder builder() {
		return new ConversationFeedbackBuilder();
	}

	public static class ConversationFeedbackBuilder {
		private Long id;
		private SpeakingSession session;
		private String grammarCorrections;
		private String betterSentences;
		private String vocabularySuggestions;
		private String summary;

		public ConversationFeedbackBuilder id(Long id) { this.id = id; return this; }
		public ConversationFeedbackBuilder session(SpeakingSession session) { this.session = session; return this; }
		public ConversationFeedbackBuilder grammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; return this; }
		public ConversationFeedbackBuilder betterSentences(String betterSentences) { this.betterSentences = betterSentences; return this; }
		public ConversationFeedbackBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
		public ConversationFeedbackBuilder summary(String summary) { this.summary = summary; return this; }

		public ConversationFeedback build() {
            ConversationFeedback obj = new ConversationFeedback();
            obj.setId(id);
            obj.setSession(session);
            obj.setGrammarCorrections(grammarCorrections);
            obj.setBetterSentences(betterSentences);
            obj.setVocabularySuggestions(vocabularySuggestions);
            obj.setSummary(summary);
            return obj;
        }
	}
}
