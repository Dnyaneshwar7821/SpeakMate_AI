package com.rslsolution.speakmateai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

/**
 * One-shot diagnostic: dumps the raw student rows with their school_id and school_name
 * so we can see which students are incorrectly associated with a school.
 * Run with: mvn test -Dtest=DiagnosticStudentData -pl .
 */
@SpringBootTest
public class DiagnosticStudentData {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void dumpStudentsAndSchools() {
        System.out.println("\n===== SCHOOLS TABLE =====");
        List<Map<String, Object>> schools = jdbcTemplate.queryForList(
                "SELECT id, name, school_name FROM schools ORDER BY id");
        for (Map<String, Object> row : schools) {
            System.out.println("School ID=" + row.get("id") + " | name=" + row.get("name") + " | school_name=" + row.get("school_name"));
        }

        System.out.println("\n===== STUDENTS (joined with users) =====");
        List<Map<String, Object>> students = jdbcTemplate.queryForList(
                "SELECT u.id, u.first_name, u.last_name, u.school_id, u.school_name, u.role " +
                "FROM students s JOIN users u ON s.id = u.id ORDER BY u.school_id NULLS LAST");
        for (Map<String, Object> row : students) {
            System.out.println(
                "Student ID=" + row.get("id") +
                " | Name=" + row.get("first_name") + " " + row.get("last_name") +
                " | school_id=" + row.get("school_id") +
                " | school_name=" + row.get("school_name") +
                " | role=" + row.get("role")
            );
        }

        System.out.println("\n===== SCHOOL_ADMIN users =====");
        List<Map<String, Object>> admins = jdbcTemplate.queryForList(
                "SELECT id, first_name, last_name, school_id, school_name, email FROM users WHERE role='SCHOOL_ADMIN' ORDER BY school_id NULLS LAST");
        for (Map<String, Object> row : admins) {
            System.out.println(
                "Admin ID=" + row.get("id") +
                " | Name=" + row.get("first_name") + " " + row.get("last_name") +
                " | school_id=" + row.get("school_id") +
                " | school_name=" + row.get("school_name") +
                " | email=" + row.get("email")
            );
        }
    }
}
