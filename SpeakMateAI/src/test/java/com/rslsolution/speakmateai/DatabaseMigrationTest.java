package com.rslsolution.speakmateai;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseMigrationTest {

    @Test
    @Disabled("Manual migration script - disabled during automated CI/CD builds")
    public void executeMigration() {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");

        if (dbUrl == null || dbUrl.isBlank()) {
            System.out.println("Skipping migration: SPRING_DATASOURCE_URL environment variable is not configured.");
            return;
        }

        try (Connection conn = DriverManager.getConnection(dbUrl, username, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to Neon PostgreSQL DB successfully!");

            String[] queries = {
                "CREATE TABLE IF NOT EXISTS user_subscriptions (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, plan_type VARCHAR(255) DEFAULT 'FREE', status VARCHAR(255) DEFAULT 'ACTIVE', amount NUMERIC(38,2), currency VARCHAR(255) DEFAULT 'INR', razorpay_order_id VARCHAR(255), razorpay_payment_id VARCHAR(255), razorpay_signature VARCHAR(255), start_date TIMESTAMP, end_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS plan_type VARCHAR(255) DEFAULT 'FREE'",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'ACTIVE'",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS amount NUMERIC(38,2)",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS currency VARCHAR(255) DEFAULT 'INR'",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255)",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE user_subscriptions ALTER COLUMN amount_paid DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN subscription_plan_id DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN payment_status DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN subscription_status DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN payment_method DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN expiry_date DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN transaction_id DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN start_date DROP NOT NULL",
                "ALTER TABLE user_subscriptions ALTER COLUMN end_date DROP NOT NULL"
            };

            for (String q : queries) {
                try {
                    stmt.execute(q);
                    System.out.println("Executed: " + q);
                } catch (Exception e) {
                    System.out.println("Notice for query [" + q + "]: " + e.getMessage());
                }
            }

            try (ResultSet rs = stmt.executeQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_subscriptions'")) {
                System.out.println("Columns in user_subscriptions:");
                while (rs.next()) {
                    System.out.println(" - " + rs.getString("column_name") + " (" + rs.getString("data_type") + ")");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
