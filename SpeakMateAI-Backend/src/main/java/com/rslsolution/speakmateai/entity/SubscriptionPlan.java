package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String planName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer durationMonths;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String features;

    private Integer maxLessons;
    private Integer maxTests;
    private Integer aiPracticeLimit;
    private Integer grammarPracticeLimit;
    private Integer speakingPracticeLimit;
    private Integer vocabularyPracticeLimit;

    private Integer aiMinutesLimit;
    private String billingCycle;
    private Integer studentLimit;
    private Integer teacherLimit;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public String getName() {
        return planName;
    }

    public void setName(String name) {
        this.planName = name;
    }

    public boolean isActive() {
        return isActive != null && isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public Integer getMaxLessons() { return maxLessons; }
    public void setMaxLessons(Integer maxLessons) { this.maxLessons = maxLessons; }

    public Integer getMaxTests() { return maxTests; }
    public void setMaxTests(Integer maxTests) { this.maxTests = maxTests; }

    public Integer getAiPracticeLimit() { return aiPracticeLimit; }
    public void setAiPracticeLimit(Integer aiPracticeLimit) { this.aiPracticeLimit = aiPracticeLimit; }

    public Integer getGrammarPracticeLimit() { return grammarPracticeLimit; }
    public void setGrammarPracticeLimit(Integer grammarPracticeLimit) { this.grammarPracticeLimit = grammarPracticeLimit; }

    public Integer getSpeakingPracticeLimit() { return speakingPracticeLimit; }
    public void setSpeakingPracticeLimit(Integer speakingPracticeLimit) { this.speakingPracticeLimit = speakingPracticeLimit; }

    public Integer getVocabularyPracticeLimit() { return vocabularyPracticeLimit; }
    public void setVocabularyPracticeLimit(Integer vocabularyPracticeLimit) { this.vocabularyPracticeLimit = vocabularyPracticeLimit; }

    public Integer getAiMinutesLimit() { return aiMinutesLimit; }
    public void setAiMinutesLimit(Integer aiMinutesLimit) { this.aiMinutesLimit = aiMinutesLimit; }

    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }

    public Integer getStudentLimit() { return studentLimit; }
    public void setStudentLimit(Integer studentLimit) { this.studentLimit = studentLimit; }

    public Integer getTeacherLimit() { return teacherLimit; }
    public void setTeacherLimit(Integer teacherLimit) { this.teacherLimit = teacherLimit; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
