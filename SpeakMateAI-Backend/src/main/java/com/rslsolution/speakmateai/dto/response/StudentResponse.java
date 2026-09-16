package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String studentId;
    private Long schoolId;
    private String schoolName;
    private String standard;
    private String division;
    private String rollNumber;
    private String parentName;
    private String parentPhone;
    private String phone;
    private Long teacherId;
    private String teacherName;
    private String assignedTeacher;
    private Boolean active;
    private Status status;
    private LocalDateTime createdAt;
    private Integer xp;
    private Integer level;
    private Double averageScore;
    private Integer speakingSessions;
    private Integer practiceMinutes;
    private Boolean emailSent;

    public String getAssignedTeacher() {
        return assignedTeacher != null && !assignedTeacher.isBlank() ? assignedTeacher : teacherName;
    }

    public String getTeacherName() {
        return teacherName != null && !teacherName.isBlank() ? teacherName : assignedTeacher;
    }
}
