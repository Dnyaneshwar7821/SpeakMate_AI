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
}
