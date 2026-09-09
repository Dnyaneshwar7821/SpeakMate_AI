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

	@Column(length = 100)
	private String phonetic;

	@Column(length = 50)
	private String partOfSpeech;

	@Column(columnDefinition = "TEXT")
	private String collocations;

	@Column(length = 50)
	private String level;

	private Boolean favorite;

	private Boolean mastered;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		if (favorite == null) favorite = false;
		if (mastered == null) mastered = false;
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

	public String getPhonetic() { return phonetic; }
	public void setPhonetic(String phonetic) { this.phonetic = phonetic; }

	public String getPartOfSpeech() { return partOfSpeech; }
	public void setPartOfSpeech(String partOfSpeech) { this.partOfSpeech = partOfSpeech; }

	public String getCollocations() { return collocations; }
	public void setCollocations(String collocations) { this.collocations = collocations; }

	public String getLevel() { return level; }
	public void setLevel(String level) { this.level = level; }

	public Boolean getFavorite() { return favorite; }
	public void setFavorite(Boolean favorite) { this.favorite = favorite; }

	public Boolean getMastered() { return mastered; }
	public void setMastered(Boolean mastered) { this.mastered = mastered; }

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
		private String phonetic;
		private String partOfSpeech;
		private String collocations;
		private String level;
		private Boolean favorite = false;
		private Boolean mastered = false;
		private LocalDateTime createdAt;

		public VocabularyBuilder id(Long id) { this.id = id; return this; }
		public VocabularyBuilder user(User user) { this.user = user; return this; }
		public VocabularyBuilder word(String word) { this.word = word; return this; }
		public VocabularyBuilder meaning(String meaning) { this.meaning = meaning; return this; }
		public VocabularyBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
		public VocabularyBuilder synonym(String synonym) { this.synonym = synonym; return this; }
		public VocabularyBuilder antonym(String antonym) { this.antonym = antonym; return this; }
		public VocabularyBuilder phonetic(String phonetic) { this.phonetic = phonetic; return this; }
		public VocabularyBuilder partOfSpeech(String partOfSpeech) { this.partOfSpeech = partOfSpeech; return this; }
		public VocabularyBuilder collocations(String collocations) { this.collocations = collocations; return this; }
		public VocabularyBuilder level(String level) { this.level = level; return this; }
		public VocabularyBuilder favorite(Boolean favorite) { this.favorite = favorite; return this; }
		public VocabularyBuilder mastered(Boolean mastered) { this.mastered = mastered; return this; }
		public VocabularyBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public Vocabulary build() {
			Vocabulary obj = new Vocabulary();
			obj.setId(id);
			obj.setUser(user);
			obj.setWord(word);
			obj.setMeaning(meaning);
			obj.setExampleSentence(exampleSentence);
			obj.setSynonym(synonym);
			obj.setAntonym(antonym);
			obj.setPhonetic(phonetic);
			obj.setPartOfSpeech(partOfSpeech);
			obj.setCollocations(collocations);
			obj.setLevel(level);
			obj.setFavorite(favorite);
			obj.setMastered(mastered);
			obj.setCreatedAt(createdAt);
			return obj;
		}
	}
}