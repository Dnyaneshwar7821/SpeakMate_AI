package com.rslsolution.speakmateai.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.entity.Assignment;
import com.rslsolution.speakmateai.entity.AssignmentProgress;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.AssignmentProgressRepository;
import com.rslsolution.speakmateai.repository.AssignmentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StudentAssignmentController {

    private final UserRepository userRepository;
    private final AssignmentProgressRepository assignmentProgressRepository;
    private final AssignmentRepository assignmentRepository;

    @GetMapping("/api/v1/student/assignments")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.ok(List.of());
        }

        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        User user = userOpt.get();
        List<AssignmentProgress> progressList = assignmentProgressRepository.findByStudentId(user.getId());
        if (progressList == null || progressList.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (AssignmentProgress progress : progressList) {
            if ("COMPLETED".equalsIgnoreCase(progress.getStatus())) {
                continue; // Only pending/assigned
            }
            Optional<Assignment> asgOpt = assignmentRepository.findById(progress.getAssignmentId());
            if (asgOpt.isPresent()) {
                Assignment asg = asgOpt.get();
                Map<String, Object> item = new HashMap<>();
                item.put("id", asg.getId());
                item.put("progressId", progress.getId());
                item.put("title", asg.getTitle() != null ? asg.getTitle() : "Homework Assignment");
                item.put("description", asg.getDescription() != null ? asg.getDescription() : "");
                item.put("targetMinutes", asg.getTargetMinutes() != null ? asg.getTargetMinutes() : 15);
                item.put("minimumScore", asg.getMinimumScore() != null ? asg.getMinimumScore() : 70);
                item.put("dueDate", asg.getDueDate() != null ? asg.getDueDate().toString() : "Upcoming");
                item.put("className", user.getSchoolGrade() != null ? user.getSchoolGrade() : "Grade");
                item.put("status", progress.getStatus() != null ? progress.getStatus() : "ASSIGNED");
                response.add(item);
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/student/assignments/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeAssignment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                List<AssignmentProgress> progressList = assignmentProgressRepository.findByStudentId(user.getId());
                if (progressList != null) {
                    for (AssignmentProgress ap : progressList) {
                        if (ap.getAssignmentId() != null && ap.getAssignmentId().equals(id)) {
                            ap.setStatus("COMPLETED");
                            ap.setCompletedAt(LocalDateTime.now());
                            if (payload != null && payload.get("score") instanceof Number) {
                                ap.setScore(((Number) payload.get("score")).intValue());
                            }
                            assignmentProgressRepository.save(ap);
                            break;
                        }
                    }
                }
            });
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Assignment completed successfully"));
    }

    @GetMapping({"/api/v1/school/announcements", "/api/v1/announcements"})
    public ResponseEntity<List<Map<String, Object>>> getAnnouncements() {
        return ResponseEntity.ok(List.of());
    }
}
