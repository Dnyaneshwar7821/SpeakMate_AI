package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class CheckDB6 implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public CheckDB6(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- CHECKING ALL SCHEMAS FOR PROGRESS TABLE ---");
        try {
            List<Map<String, Object>> schemas = jdbcTemplate.queryForList("SELECT table_schema, column_name FROM information_schema.columns WHERE table_name = 'progress'");
            System.out.println("Schemas: " + schemas);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
