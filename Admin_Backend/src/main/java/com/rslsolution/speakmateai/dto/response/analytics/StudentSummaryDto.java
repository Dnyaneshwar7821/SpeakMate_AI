package com.rslsolution.speakmateai.dto.response.analytics;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryDto {
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private boolean active;
    private String learningGoal;
    private Integer dailyGoalMinutes;
    private String englishLevel;
    
    // Institutional / School attributes
    private Long schoolId;
    private String schoolName;
    private String standard;
    private String division;
    private String rollNumber;
    private Long teacherId;
    private String teacherName;
    private String assignedTeacher;
    
    private LocalDateTime registeredAt;

    public String getAssignedTeacher() {
        return assignedTeacher != null && !assignedTeacher.isBlank() ? assignedTeacher : teacherName;
    }

    public String getTeacherName() {
        return teacherName != null && !teacherName.isBlank() ? teacherName : assignedTeacher;
    }
}
