package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_prompt_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPromptVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String promptType; // CONVERSATION_TUTOR, GRAMMAR_TUTOR, VOCABULARY_TUTOR, SPEAKING_EVALUATOR

    @Column(nullable = false)
    private String version; // e.g. 'v1.0', 'v2.1'

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    private String model; // e.g. 'llama-3.3-70b-versatile'
    private Double temperature;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
