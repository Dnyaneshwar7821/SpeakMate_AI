package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSchoolUserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    private String schoolName;
    private String standard;
    private String division;
    private String rollNumber;
    
    private String parentName;
    private String parentPhone;
    
    private Long teacherId;
    private String assignedTeacher;
    
    private boolean active;
    private LocalDateTime createdAt;
    
    // Progress statistics
    private long totalLessonsCompleted;
    private long totalSpeakingSessions;
    private long totalGrammarSessions;
    private long totalVocabularySaved;
    private Double averageScore;

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }

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

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getStandard() { return standard; }
    public void setStandard(String standard) { this.standard = standard; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getAssignedTeacher() { return assignedTeacher; }
    public void setAssignedTeacher(String assignedTeacher) { this.assignedTeacher = assignedTeacher; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getTotalLessonsCompleted() { return totalLessonsCompleted; }
    public void setTotalLessonsCompleted(long totalLessonsCompleted) { this.totalLessonsCompleted = totalLessonsCompleted; }

    public long getTotalSpeakingSessions() { return totalSpeakingSessions; }
    public void setTotalSpeakingSessions(long totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

    public long getTotalGrammarSessions() { return totalGrammarSessions; }
    public void setTotalGrammarSessions(long totalGrammarSessions) { this.totalGrammarSessions = totalGrammarSessions; }

    public long getTotalVocabularySaved() { return totalVocabularySaved; }
    public void setTotalVocabularySaved(long totalVocabularySaved) { this.totalVocabularySaved = totalVocabularySaved; }

    public static AdminSchoolUserResponseBuilder builder() {
        return new AdminSchoolUserResponseBuilder();
    }

    public static class AdminSchoolUserResponseBuilder {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String schoolName;
        private String standard;
        private String division;
        private String rollNumber;
        private String parentName;
        private String parentPhone;
        private Long teacherId;
        private String assignedTeacher;
        private boolean active;
        private LocalDateTime createdAt;
        private long totalLessonsCompleted;
        private long totalSpeakingSessions;
        private long totalGrammarSessions;
        private long totalVocabularySaved;
        private Double averageScore;

        public AdminSchoolUserResponseBuilder id(Long id) { this.id = id; return this; }
        public AdminSchoolUserResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AdminSchoolUserResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AdminSchoolUserResponseBuilder email(String email) { this.email = email; return this; }
        public AdminSchoolUserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminSchoolUserResponseBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
        public AdminSchoolUserResponseBuilder standard(String standard) { this.standard = standard; return this; }
        public AdminSchoolUserResponseBuilder division(String division) { this.division = division; return this; }
        public AdminSchoolUserResponseBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public AdminSchoolUserResponseBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public AdminSchoolUserResponseBuilder parentPhone(String parentPhone) { this.parentPhone = parentPhone; return this; }
        public AdminSchoolUserResponseBuilder teacherId(Long teacherId) { this.teacherId = teacherId; return this; }
        public AdminSchoolUserResponseBuilder assignedTeacher(String assignedTeacher) { this.assignedTeacher = assignedTeacher; return this; }
        public AdminSchoolUserResponseBuilder active(boolean active) { this.active = active; return this; }
        public AdminSchoolUserResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AdminSchoolUserResponseBuilder totalLessonsCompleted(long totalLessonsCompleted) { this.totalLessonsCompleted = totalLessonsCompleted; return this; }
        public AdminSchoolUserResponseBuilder totalSpeakingSessions(long totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
        public AdminSchoolUserResponseBuilder totalGrammarSessions(long totalGrammarSessions) { this.totalGrammarSessions = totalGrammarSessions; return this; }
        public AdminSchoolUserResponseBuilder totalVocabularySaved(long totalVocabularySaved) { this.totalVocabularySaved = totalVocabularySaved; return this; }
        public AdminSchoolUserResponseBuilder averageScore(Double averageScore) { this.averageScore = averageScore; return this; }

        public AdminSchoolUserResponse build() {
            AdminSchoolUserResponse r = new AdminSchoolUserResponse();
            r.id = id;
            r.firstName = firstName;
            r.lastName = lastName;
            r.email = email;
            r.phone = phone;
            r.schoolName = schoolName;
            r.standard = standard;
            r.division = division;
            r.rollNumber = rollNumber;
            r.parentName = parentName;
            r.parentPhone = parentPhone;
            r.teacherId = teacherId;
            r.assignedTeacher = assignedTeacher;
            r.active = active;
            r.createdAt = createdAt;
            r.totalLessonsCompleted = totalLessonsCompleted;
            r.totalSpeakingSessions = totalSpeakingSessions;
            r.totalGrammarSessions = totalGrammarSessions;
            r.totalVocabularySaved = totalVocabularySaved;
            r.averageScore = averageScore;
            return r;
        }
    }
}
