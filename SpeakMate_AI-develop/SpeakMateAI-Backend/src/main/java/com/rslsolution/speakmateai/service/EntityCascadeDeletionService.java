package com.rslsolution.speakmateai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EntityCascadeDeletionService {

    private static final Logger log = LoggerFactory.getLogger(EntityCascadeDeletionService.class);

    private final JdbcTemplate jdbcTemplate;

    public EntityCascadeDeletionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private void runUpdate(String sql, Object... params) {
        try {
            int rows = jdbcTemplate.update(sql, params);
            if (rows > 0) {
                log.debug("[Cascade Delete] {} -> affected {} rows", sql, rows);
            }
        } catch (Exception e) {
            log.warn("[Cascade Delete Warning] Non-fatal error executing '{}': {}", sql, e.getMessage());
        }
    }

    private List<Long> queryIds(String sql, Object... params) {
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong(1), params);
        } catch (Exception e) {
            log.warn("[Cascade Delete Warning] Query failed '{}': {}", sql, e.getMessage());
            return List.of();
        }
    }

    /**
     * Permanently deletes a student/school user and all dependent records from the database.
     */
    @Transactional
    public void deleteStudentCascade(Long studentId) {
        if (studentId == null) {
            return;
        }
        log.info("[Cascade Delete] Starting permanent hard delete for student/user ID: {}", studentId);

        // 1. Teacher reports
        runUpdate("DELETE FROM teacher_reports WHERE student_id = ?", studentId);

        // 2. Classroom & assignments progress
        runUpdate("DELETE FROM assignment_progress WHERE student_id = ?", studentId);
        runUpdate("DELETE FROM class_students WHERE student_id = ?", studentId);

        // 3. Chat sessions & bookmarks & messages
        runUpdate("DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)", studentId);
        runUpdate("DELETE FROM chat_bookmarks WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM chat_history WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM chat_sessions WHERE user_id = ?", studentId);

        // 4. Speaking sessions & feedbacks
        runUpdate("DELETE FROM conversation_messages WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id = ?)", studentId);
        runUpdate("DELETE FROM conversation_feedbacks WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id = ?)", studentId);
        runUpdate("DELETE FROM speaking_sessions WHERE user_id = ?", studentId);

        // 5. Learning, grammar, results, achievements
        runUpdate("DELETE FROM grammar_history WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM lesson_progress WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM notification WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM results WHERE student_id = ?", studentId);
        runUpdate("DELETE FROM certificates WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM progress WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM onboarding WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM settings WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM vocabulary WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM achievement WHERE user_id = ?", studentId);

        // 6. Billing, payments, subscriptions
        runUpdate("DELETE FROM invoices WHERE payment_id IN (SELECT id FROM payments WHERE user_id = ?)", studentId);
        runUpdate("DELETE FROM refunds WHERE payment_id IN (SELECT id FROM payments WHERE user_id = ?)", studentId);
        runUpdate("DELETE FROM payments WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM user_subscriptions WHERE user_id = ?", studentId);

        // 7. Audit & AI usage
        runUpdate("DELETE FROM ai_usage_logs WHERE user_id = ?", studentId);
        runUpdate("DELETE FROM audit_logs WHERE user_id = ?", studentId);

        // 8. Unlink from school_admins
        runUpdate("DELETE FROM school_admins WHERE user_id = ?", studentId);

        // 9. Delete from child table 'students'
        runUpdate("DELETE FROM students WHERE id = ?", studentId);

        // 10. Delete from child table 'teachers'
        runUpdate("DELETE FROM teachers WHERE id = ?", studentId);

        // 11. Delete from parent table 'users'
        runUpdate("DELETE FROM users WHERE id = ?", studentId);

        log.info("[Cascade Delete] Completed permanent hard delete for student/user ID: {}", studentId);
    }

    /**
     * Permanently deletes a teacher and unlinks dependent records from the database.
     */
    @Transactional
    public void deleteTeacherCascade(Long teacherId) {
        if (teacherId == null) {
            return;
        }
        log.info("[Cascade Delete] Starting permanent hard delete for teacher ID: {}", teacherId);

        // 1. Unlink students and users from this teacher
        runUpdate("UPDATE students SET teacher_id = NULL WHERE teacher_id = ?", teacherId);
        runUpdate("UPDATE users SET teacher_id = NULL WHERE teacher_id = ?", teacherId);

        // 2. Unlink classroom
        runUpdate("UPDATE class_rooms SET teacher_id = NULL WHERE teacher_id = ?", teacherId);

        // 3. Remove teacher standard divisions & reports
        runUpdate("DELETE FROM teacher_standard_divisions WHERE teacher_id = ?", teacherId);
        runUpdate("DELETE FROM teacher_reports WHERE teacher_id = ?", teacherId);

        // 4. Assignments created by teacher
        runUpdate("DELETE FROM assignment_progress WHERE assignment_id IN (SELECT id FROM assignments WHERE teacher_id = ?)", teacherId);
        runUpdate("DELETE FROM assignments WHERE teacher_id = ?", teacherId);

        // 5. User sessions & activity for teacher
        runUpdate("DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)", teacherId);
        runUpdate("DELETE FROM chat_bookmarks WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM chat_sessions WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM chat_history WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM conversation_messages WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id = ?)", teacherId);
        runUpdate("DELETE FROM conversation_feedbacks WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id = ?)", teacherId);
        runUpdate("DELETE FROM speaking_sessions WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM notification WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM settings WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM ai_usage_logs WHERE user_id = ?", teacherId);
        runUpdate("DELETE FROM audit_logs WHERE user_id = ?", teacherId);

        // 6. Delete from child table 'teachers'
        runUpdate("DELETE FROM teachers WHERE id = ?", teacherId);

        // 7. Delete from parent table 'users'
        runUpdate("DELETE FROM users WHERE id = ?", teacherId);

        log.info("[Cascade Delete] Completed permanent hard delete for teacher ID: {}", teacherId);
    }

    /**
     * Permanently deletes a school and all associated standards, classrooms, and members.
     */
    @Transactional
    public void deleteSchoolCascade(Long schoolId) {
        if (schoolId == null) {
            return;
        }
        log.info("[Cascade Delete] Starting permanent hard delete for school ID: {}", schoolId);

        // 1. Clean up standards and divisions belonging to this school
        runUpdate("DELETE FROM teacher_standard_divisions WHERE standard_division_id IN (SELECT id FROM standard_divisions WHERE school_standard_id IN (SELECT id FROM school_standards WHERE school_id = ?))", schoolId);
        runUpdate("DELETE FROM standard_divisions WHERE school_standard_id IN (SELECT id FROM school_standards WHERE school_id = ?)", schoolId);
        runUpdate("DELETE FROM school_standards WHERE school_id = ?", schoolId);

        // 2. Unlink/clean school admins
        runUpdate("DELETE FROM school_admins WHERE school_id = ?", schoolId);
        runUpdate("DELETE FROM school_admins WHERE user_id IN (SELECT id FROM users WHERE school_id = ?)", schoolId);

        // 3. Delete all users belonging to this school (students, teachers, school admins)
        List<Long> allSchoolUserIds = queryIds("SELECT id FROM users WHERE school_id = ?", schoolId);
        for (Long uid : allSchoolUserIds) {
            deleteStudentCascade(uid);
        }

        // 4. In case any user wasn't deleted, clear school_id
        runUpdate("UPDATE users SET school_id = NULL WHERE school_id = ?", schoolId);
        runUpdate("UPDATE admins SET school_id = NULL WHERE school_id = ?", schoolId);

        // 5. Clean up assignments and classrooms for this school
        runUpdate("DELETE FROM assignment_progress WHERE assignment_id IN (SELECT id FROM assignments WHERE school_id = ?)", schoolId);
        runUpdate("DELETE FROM assignments WHERE school_id = ?", schoolId);
        runUpdate("DELETE FROM class_students WHERE classroom_id IN (SELECT id FROM class_rooms WHERE school_id = ?)", schoolId);
        runUpdate("DELETE FROM class_rooms WHERE school_id = ?", schoolId);

        // 6. Clean up logs & notifications for this school
        runUpdate("DELETE FROM notification WHERE school_id = ?", schoolId);
        runUpdate("DELETE FROM audit_logs WHERE school_id = ?", schoolId);
        runUpdate("DELETE FROM ai_usage_logs WHERE school_id = ?", schoolId);

        // 7. Finally delete the school record itself
        runUpdate("DELETE FROM schools WHERE id = ?", schoolId);

        log.info("[Cascade Delete] Completed permanent hard delete for school ID: {}", schoolId);
    }
}
