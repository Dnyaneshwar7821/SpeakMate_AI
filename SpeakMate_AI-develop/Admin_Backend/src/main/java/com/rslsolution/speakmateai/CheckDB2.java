package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class CheckDB2 implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;
    public CheckDB2(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @Override
    public void run(String... args) {
        System.out.println("--- CHECKING DATABASE SCHEMAS ---");
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT table_schema, column_name, data_type FROM information_schema.columns WHERE table_name = 'progress'"
            );
            System.out.println("Schemas with progress table: " + columns);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
