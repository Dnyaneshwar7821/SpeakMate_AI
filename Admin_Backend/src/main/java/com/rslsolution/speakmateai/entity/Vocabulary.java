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

	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
	private Student student;

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

	public Boolean getMastered() { return mastered != null ? mastered : false; }
	public void setMastered(Boolean mastered) { this.mastered = mastered; }
	public Boolean getFavorite() { return favorite != null ? favorite : false; }
	public void setFavorite(Boolean favorite) { this.favorite = favorite; }

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}
}