package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabulary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String word;

	@Column(columnDefinition = "TEXT")
	private String meaning;

	@Column(columnDefinition = "TEXT")
	private String exampleSentence;

	@Column(columnDefinition = "TEXT")
	private String synonym;

	@Column(columnDefinition = "TEXT")
	private String antonym;

	private Boolean favorite;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getWord() { return word; }
	public void setWord(String word) { this.word = word; }

	public String getMeaning() { return meaning; }
	public void setMeaning(String meaning) { this.meaning = meaning; }

	public String getExampleSentence() { return exampleSentence; }
	public void setExampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; }

	public String getSynonym() { return synonym; }
	public void setSynonym(String synonym) { this.synonym = synonym; }

	public String getAntonym() { return antonym; }
	public void setAntonym(String antonym) { this.antonym = antonym; }

	public Boolean getFavorite() { return favorite; }
	public void setFavorite(Boolean favorite) { this.favorite = favorite; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static VocabularyBuilder builder() {
		return new VocabularyBuilder();
	}

	public static class VocabularyBuilder {
		private Long id;
		private User user;
		private String word;
		private String meaning;
		private String exampleSentence;
		private String synonym;
		private String antonym;
		private Boolean favorite;
		private LocalDateTime createdAt;

		public VocabularyBuilder id(Long id) { this.id = id; return this; }
		public VocabularyBuilder user(User user) { this.user = user; return this; }
		public VocabularyBuilder word(String word) { this.word = word; return this; }
		public VocabularyBuilder meaning(String meaning) { this.meaning = meaning; return this; }
		public VocabularyBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
		public VocabularyBuilder synonym(String synonym) { this.synonym = synonym; return this; }
		public VocabularyBuilder antonym(String antonym) { this.antonym = antonym; return this; }
		public VocabularyBuilder favorite(Boolean favorite) { this.favorite = favorite; return this; }
		public VocabularyBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public Vocabulary build() {
			return new Vocabulary(id, user, word, meaning, exampleSentence, synonym, antonym, favorite, createdAt);
		}
	}
}