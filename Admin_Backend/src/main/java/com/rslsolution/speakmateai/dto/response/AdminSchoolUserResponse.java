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
    private String teacherName;
    
    private boolean active;
    private LocalDateTime createdAt;
    
    // Progress statistics
    private long totalLessonsCompleted;
    private long totalSpeakingSessions;
    private long totalGrammarSessions;
    private long totalVocabularySaved;
    private Boolean emailSent;

    public String getAssignedTeacher() {
        return assignedTeacher != null && !assignedTeacher.isBlank() ? assignedTeacher : teacherName;
    }

    public void setAssignedTeacher(String assignedTeacher) {
        this.assignedTeacher = assignedTeacher;
        if (this.teacherName == null || this.teacherName.isBlank()) {
            this.teacherName = assignedTeacher;
        }
    }

    public String getTeacherName() {
        return teacherName != null && !teacherName.isBlank() ? teacherName : assignedTeacher;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
        if (this.assignedTeacher == null || this.assignedTeacher.isBlank()) {
            this.assignedTeacher = teacherName;
        }
    }
}
