package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long schoolId;

    @Column(nullable = false)
    private Long teacherId;

    @Column(nullable = false)
    private Long classId;

    @Column(nullable = false)
    private String type; // LESSON, SPEAKING, GRAMMAR, VOCABULARY, AI_CONVERSATION

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long lessonId;
    private Integer targetMinutes;
    private Integer minimumScore;
    private LocalDateTime dueDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
