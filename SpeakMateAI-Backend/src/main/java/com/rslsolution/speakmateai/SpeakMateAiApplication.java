package com.rslsolution.speakmateai;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpeakMateAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpeakMateAiApplication.class, args);
		System.err.println("App Started..");
	}

	@Bean
	public CommandLineRunner fixDatabaseConstraints(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE progress DROP CONSTRAINT IF EXISTS fkg57pksd9hda15sacdaat75y28");
				System.out.println("[Database Repair] Dropped invalid constraint fkg57pksd9hda15sacdaat75y28 on progress table.");
			} catch (Exception e) {
				System.err.println("[Database Repair Warning] progress constraint drop: " + e.getMessage());
			}

			try {
				jdbcTemplate.execute("ALTER TABLE progress ADD CONSTRAINT fk_progress_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
				System.out.println("[Database Repair] Added valid fk_progress_users constraint pointing to users(id).");
			} catch (Exception e) {
				// Constraint may already exist
			}
		};
	}

}
