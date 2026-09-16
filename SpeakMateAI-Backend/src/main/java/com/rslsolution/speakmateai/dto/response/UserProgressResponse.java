package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressResponse {
    
    private int overallProgress; // Percentage 0-100
    private int lessonsCompleted;
    private int testsCompleted;
    private int totalLearningHours;
    private double completionPercentage;
    private int weeklyProgress; // Percentage or XP gained this week

    private Integer xp;
    private Integer level;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalPracticeMinutes;
    private Integer totalSpeakingSessions;
    private Integer totalGrammarChecks;
    private Integer totalVocabularyWords;
    private String learningGoal;

}
