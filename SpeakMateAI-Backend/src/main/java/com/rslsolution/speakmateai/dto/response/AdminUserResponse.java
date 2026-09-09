package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    
    // Basic Details
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatar;
    private Role role;
    private boolean active;
    
    // Learning Information
    private String nativeLanguage;
    private String englishLevel;
    private String learningGoal;
    private Integer dailyGoalMinutes;
    private String preferredVoice;
    private String preferredAccent;
    private String ageGroup;
    
    // Statistics & Metadata
    private int totalSpeakingSessions;
    private int totalGrammarSessions;
    private int totalVocabularySaved;
    private int totalLessonsCompleted;
    private int totalAchievements;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getNativeLanguage() { return nativeLanguage; }
    public void setNativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; }

    public String getEnglishLevel() { return englishLevel; }
    public void setEnglishLevel(String englishLevel) { this.englishLevel = englishLevel; }

    public String getLearningGoal() { return learningGoal; }
    public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }

    public Integer getDailyGoalMinutes() { return dailyGoalMinutes; }
    public void setDailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; }

    public String getPreferredVoice() { return preferredVoice; }
    public void setPreferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; }

    public String getPreferredAccent() { return preferredAccent; }
    public void setPreferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public int getTotalSpeakingSessions() { return totalSpeakingSessions; }
    public void setTotalSpeakingSessions(int totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

    public int getTotalGrammarSessions() { return totalGrammarSessions; }
    public void setTotalGrammarSessions(int totalGrammarSessions) { this.totalGrammarSessions = totalGrammarSessions; }

    public int getTotalVocabularySaved() { return totalVocabularySaved; }
    public void setTotalVocabularySaved(int totalVocabularySaved) { this.totalVocabularySaved = totalVocabularySaved; }

    public int getTotalLessonsCompleted() { return totalLessonsCompleted; }
    public void setTotalLessonsCompleted(int totalLessonsCompleted) { this.totalLessonsCompleted = totalLessonsCompleted; }

    public int getTotalAchievements() { return totalAchievements; }
    public void setTotalAchievements(int totalAchievements) { this.totalAchievements = totalAchievements; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static AdminUserResponseBuilder builder() {
        return new AdminUserResponseBuilder();
    }

    public static class AdminUserResponseBuilder {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String avatar;
        private Role role;
        private boolean active;
        private String nativeLanguage;
        private String englishLevel;
        private String learningGoal;
        private Integer dailyGoalMinutes;
        private String preferredVoice;
        private String preferredAccent;
        private String ageGroup;
        private int totalSpeakingSessions;
        private int totalGrammarSessions;
        private int totalVocabularySaved;
        private int totalLessonsCompleted;
        private int totalAchievements;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public AdminUserResponseBuilder id(Long id) { this.id = id; return this; }
        public AdminUserResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AdminUserResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AdminUserResponseBuilder email(String email) { this.email = email; return this; }
        public AdminUserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminUserResponseBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public AdminUserResponseBuilder role(Role role) { this.role = role; return this; }
        public AdminUserResponseBuilder active(boolean active) { this.active = active; return this; }
        public AdminUserResponseBuilder nativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; return this; }
        public AdminUserResponseBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
        public AdminUserResponseBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
        public AdminUserResponseBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
        public AdminUserResponseBuilder preferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; return this; }
        public AdminUserResponseBuilder preferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; return this; }
        public AdminUserResponseBuilder ageGroup(String ageGroup) { this.ageGroup = ageGroup; return this; }
        public AdminUserResponseBuilder totalSpeakingSessions(int totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
        public AdminUserResponseBuilder totalGrammarSessions(int totalGrammarSessions) { this.totalGrammarSessions = totalGrammarSessions; return this; }
        public AdminUserResponseBuilder totalVocabularySaved(int totalVocabularySaved) { this.totalVocabularySaved = totalVocabularySaved; return this; }
        public AdminUserResponseBuilder totalLessonsCompleted(int totalLessonsCompleted) { this.totalLessonsCompleted = totalLessonsCompleted; return this; }
        public AdminUserResponseBuilder totalAchievements(int totalAchievements) { this.totalAchievements = totalAchievements; return this; }
        public AdminUserResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AdminUserResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public AdminUserResponse build() {
            AdminUserResponse r = new AdminUserResponse();
            r.id = id;
            r.firstName = firstName;
            r.lastName = lastName;
            r.email = email;
            r.phone = phone;
            r.avatar = avatar;
            r.role = role;
            r.active = active;
            r.nativeLanguage = nativeLanguage;
            r.englishLevel = englishLevel;
            r.learningGoal = learningGoal;
            r.dailyGoalMinutes = dailyGoalMinutes;
            r.preferredVoice = preferredVoice;
            r.preferredAccent = preferredAccent;
            r.ageGroup = ageGroup;
            r.totalSpeakingSessions = totalSpeakingSessions;
            r.totalGrammarSessions = totalGrammarSessions;
            r.totalVocabularySaved = totalVocabularySaved;
            r.totalLessonsCompleted = totalLessonsCompleted;
            r.totalAchievements = totalAchievements;
            r.createdAt = createdAt;
            r.updatedAt = updatedAt;
            return r;
        }
    }
}
