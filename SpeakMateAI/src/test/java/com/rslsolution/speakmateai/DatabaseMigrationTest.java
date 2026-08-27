package com.rslsolution.speakmateai;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseMigrationTest {

    @Test
    public void executeMigration() {
        String dbUrl = "jdbc:postgresql://ep-aged-resonance-azrulowm.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
        String username = "neondb_owner";
        String password = "npg_KB5TRnXJ1Szt";

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
                "ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
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
