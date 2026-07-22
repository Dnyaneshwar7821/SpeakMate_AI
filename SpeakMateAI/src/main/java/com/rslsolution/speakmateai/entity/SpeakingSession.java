package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "speaking_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String topic; // also acts as topic/scenario name

	// scenario name specifically
	private String scenario;

	@Column(columnDefinition = "TEXT", nullable = true)
	private String transcript;

	@Column(nullable = false)
	private Integer duration; // session duration in seconds or minutes

	@Builder.Default
	private Integer xpEarned = 0;

	@Builder.Default
	private Double score = 0.0;

	private Double pronunciationScore;
	private Double fluencyScore;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double overallScore;

	@Column(columnDefinition = "TEXT")
	private String feedback;

	@Builder.Default
	@OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ConversationMessage> messages = new ArrayList<>();

	@OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	private ConversationFeedback sessionFeedback;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		if (scenario == null) {
			scenario = topic;
		}
	}
}