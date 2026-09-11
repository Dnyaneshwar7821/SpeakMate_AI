package com.rslsolution.speakmateai.mapper;

import org.springframework.stereotype.Component;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.dto.response.AdminUserResponse;

@Component
public class AdminUserMapper {

    /**
     * Maps a User entity to AdminUserResponse for list views.
     * Avoids accessing lazy-loaded collections to prevent N+1 issues.
     */
    public AdminUserResponse mapToListResponse(User user) {
        if (user == null) {
            return null;
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .active(user.isActive())
                .nativeLanguage(user.getNativeLanguage())
                .englishLevel(user.getEnglishLevel())
                .learningGoal(user.getLearningGoal())
                .dailyGoalMinutes(user.getDailyGoalMinutes())
                .preferredVoice(user.getPreferredVoice())
                .preferredAccent(user.getPreferredAccent())
                .ageGroup(user.getAgeGroup())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Maps a User entity to AdminUserResponse for detailed views.
     * Safely accesses collections to provide statistics for a single user.
     */
    public AdminUserResponse mapToDetailResponse(User user) {
        if (user == null) {
            return null;
        }

        AdminUserResponse response = mapToListResponse(user);
        
        // Add calculated statistics (triggers lazy loading safely for single user)
        if (user instanceof Student student) {
            response.setTotalSpeakingSessions(student.getSpeakingSessions() != null ? student.getSpeakingSessions().size() : 0);
            response.setTotalGrammarSessions(student.getGrammarHistories() != null ? student.getGrammarHistories().size() : 0);
            response.setTotalVocabularySaved(student.getVocabularyList() != null ? student.getVocabularyList().size() : 0);
            response.setTotalLessonsCompleted(student.getLessonProgresses() != null ? student.getLessonProgresses().size() : 0);
            response.setTotalAchievements(student.getAchievements() != null ? student.getAchievements().size() : 0);
        } else {
            response.setTotalSpeakingSessions(0);
            response.setTotalGrammarSessions(0);
            response.setTotalVocabularySaved(0);
            response.setTotalLessonsCompleted(0);
            response.setTotalAchievements(0);
        }

        return response;
    }
}
