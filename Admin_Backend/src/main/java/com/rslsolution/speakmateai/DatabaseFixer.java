package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public DatabaseFixer(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- RUNNING DATABASE FIXER ---");
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS standard_divisions (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "school_standard_id BIGINT NOT NULL, " +
                "division VARCHAR(10) NOT NULL" +
                ")");
            System.out.println("Created standard_divisions table.");
        } catch(Exception e) { e.printStackTrace(); }

        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS teacher_standard_divisions (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "teacher_id BIGINT NOT NULL, " +
                "standard_division_id BIGINT NOT NULL" +
                ")");
            System.out.println("Created teacher_standard_divisions table.");
        } catch(Exception e) { e.printStackTrace(); }

        try {
            jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN IF NOT EXISTS bio TEXT");
            jdbcTemplate.execute("ALTER TABLE teachers ADD COLUMN IF NOT EXISTS location VARCHAR(255)");
            System.out.println("Ensured bio and location columns exist in teachers table.");
        } catch(Exception e) { e.printStackTrace(); }
    }
}
