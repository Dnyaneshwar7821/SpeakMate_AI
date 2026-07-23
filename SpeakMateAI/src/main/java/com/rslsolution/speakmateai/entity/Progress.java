package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	private Integer xp;

	private Integer level;

	private Integer currentStreak;

	private Integer longestStreak;

	private Integer totalPracticeMinutes;

	private Integer totalSpeakingSessions;

	private Integer totalGrammarChecks;

	private Integer totalVocabularyWords;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public Integer getXp() { return xp; }
	public void setXp(Integer xp) { this.xp = xp; }

	public Integer getLevel() { return level; }
	public void setLevel(Integer level) { this.level = level; }

	public Integer getCurrentStreak() { return currentStreak; }
	public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

	public Integer getLongestStreak() { return longestStreak; }
	public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

	public Integer getTotalPracticeMinutes() { return totalPracticeMinutes; }
	public void setTotalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }

	public Integer getTotalSpeakingSessions() { return totalSpeakingSessions; }
	public void setTotalSpeakingSessions(Integer totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

	public Integer getTotalGrammarChecks() { return totalGrammarChecks; }
	public void setTotalGrammarChecks(Integer totalGrammarChecks) { this.totalGrammarChecks = totalGrammarChecks; }

	public Integer getTotalVocabularyWords() { return totalVocabularyWords; }
	public void setTotalVocabularyWords(Integer totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static ProgressBuilder builder() {
		return new ProgressBuilder();
	}

	public static class ProgressBuilder {
		private Long id;
		private User user;
		private Integer xp;
		private Integer level;
		private Integer currentStreak;
		private Integer longestStreak;
		private Integer totalPracticeMinutes;
		private Integer totalSpeakingSessions;
		private Integer totalGrammarChecks;
		private Integer totalVocabularyWords;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public ProgressBuilder id(Long id) { this.id = id; return this; }
		public ProgressBuilder user(User user) { this.user = user; return this; }
		public ProgressBuilder xp(Integer xp) { this.xp = xp; return this; }
		public ProgressBuilder level(Integer level) { this.level = level; return this; }
		public ProgressBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
		public ProgressBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
		public ProgressBuilder totalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; return this; }
		public ProgressBuilder totalSpeakingSessions(Integer totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
		public ProgressBuilder totalGrammarChecks(Integer totalGrammarChecks) { this.totalGrammarChecks = totalGrammarChecks; return this; }
		public ProgressBuilder totalVocabularyWords(Integer totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; return this; }
		public ProgressBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public ProgressBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public Progress build() {
            Progress obj = new Progress();
            obj.setId(id);
            obj.setUser(user);
            obj.setXp(xp);
            obj.setLevel(level);
            obj.setCurrentStreak(currentStreak);
            obj.setLongestStreak(longestStreak);
            obj.setTotalPracticeMinutes(totalPracticeMinutes);
            obj.setTotalSpeakingSessions(totalSpeakingSessions);
            obj.setTotalGrammarChecks(totalGrammarChecks);
            obj.setTotalVocabularyWords(totalVocabularyWords);
            obj.setCreatedAt(createdAt);
            obj.setUpdatedAt(updatedAt);
            return obj;
        }
	}
}