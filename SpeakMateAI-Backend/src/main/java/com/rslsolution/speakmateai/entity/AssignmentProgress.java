package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assignment_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    @Column(nullable = false)
    private Long studentId;

    @Builder.Default
    @Column(nullable = false)
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE

    private Integer score;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
