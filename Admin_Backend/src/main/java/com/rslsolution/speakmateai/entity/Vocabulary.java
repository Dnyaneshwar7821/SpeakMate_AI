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

	private Boolean favorite;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}
}