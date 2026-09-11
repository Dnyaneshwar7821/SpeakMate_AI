package com.rslsolution.speakmateai.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_usage_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long schoolId;
    private Long userId;

    private String service; // GROQ_LLM, WHISPER_STT
    private String model;

    private Integer inputTokens;
    private Integer outputTokens;
    private Integer audioSeconds;

    private BigDecimal estimatedCost;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestTime;

    @PrePersist
    public void onCreate() {
        requestTime = LocalDateTime.now();
    }
}
