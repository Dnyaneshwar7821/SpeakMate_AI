package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CheckDB implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public CheckDB(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- CHECKING DATABASE PROGRESS TABLE ---");
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'progress'"
            );
            System.out.println("Columns in progress: " + columns);
            
            // Add column if missing!
            boolean hasStudentId = columns.stream().anyMatch(col -> "student_id".equals(col.get("column_name")));
            if (!hasStudentId) {
                System.out.println("student_id is missing! Adding it now...");
                jdbcTemplate.execute("ALTER TABLE progress ADD COLUMN student_id BIGINT");
                System.out.println("Added student_id to progress table.");
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
