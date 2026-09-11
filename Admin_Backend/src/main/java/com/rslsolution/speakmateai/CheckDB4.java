package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class CheckDB4 implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public CheckDB4(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- TESTING SELECT p1_0.student_id ---");
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT p1_0.student_id FROM progress p1_0 LIMIT 1");
            System.out.println("Success! Rows: " + rows);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
