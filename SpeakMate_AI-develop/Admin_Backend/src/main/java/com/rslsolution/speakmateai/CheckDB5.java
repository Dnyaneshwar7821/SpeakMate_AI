package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CheckDB5 implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public CheckDB5(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- TESTING FULL HIBERNATE PROGRESS QUERY ---");
        try {
            String query = "select p1_0.id, p1_0.created_at, p1_0.current_streak, p1_0.level, p1_0.longest_streak, p1_0.student_id, p1_0.total_grammar_checks, p1_0.total_practice_minutes, p1_0.total_speaking_sessions, p1_0.total_vocabulary_words, p1_0.updated_at, p1_0.xp from progress p1_0 where p1_0.student_id=0";
            jdbcTemplate.execute(query);
            System.out.println("FULL QUERY SUCCEEDED!");
        } catch(Exception e) {
            System.out.println("FULL QUERY FAILED: " + e.getMessage());
        }
    }
}
