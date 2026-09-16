package com.rslsolution.speakmateai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Order(1)
public class DatabaseSchemaRepairRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaRepairRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaRepairRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        repairSchema();
    }

    @Override
    public void run(String... args) {
        repairSchema();
    }

    public void repairSchema() {
        logger.info("[Schema Repair] Starting database schema foreign key constraint repair...");

        try {
            // 1. Explicitly drop known legacy foreign key constraints pointing to 'students'
            String[] legacyConstraints = {
                "ALTER TABLE IF EXISTS onboarding DROP CONSTRAINT IF EXISTS fkn2hwcdl8e4myk0c0uw03cex3k",
                "ALTER TABLE IF EXISTS speaking_sessions DROP CONSTRAINT IF EXISTS fkbtsorovntca8vl5eslvcwfwf3",
                "ALTER TABLE IF EXISTS chat_sessions DROP CONSTRAINT IF EXISTS fkb7imwy4ndxndff5lja4rtmiol",
                "ALTER TABLE IF EXISTS lesson_progress DROP CONSTRAINT IF EXISTS fkc9w7f4g9vfalg7dtd2g0fhuaq",
                "ALTER TABLE IF EXISTS vocabulary DROP CONSTRAINT IF EXISTS fkbqom91f54g6u4iixhsq6xebdt",
                "ALTER TABLE IF EXISTS progress DROP CONSTRAINT IF EXISTS fk_progress_student",
                "ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS fk_notification_student",
                "ALTER TABLE IF EXISTS notification DROP CONSTRAINT IF EXISTS fk_notification_student",
                "ALTER TABLE IF EXISTS achievement DROP CONSTRAINT IF EXISTS fk_achievement_student",
                "ALTER TABLE IF EXISTS settings DROP CONSTRAINT IF EXISTS fk_settings_student",
                "ALTER TABLE IF EXISTS grammar_history DROP CONSTRAINT IF EXISTS fk_grammar_history_student",
                "ALTER TABLE IF EXISTS progress ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS progress DROP COLUMN IF EXISTS student_id",
                "ALTER TABLE IF EXISTS notification ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS achievement ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS settings ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS grammar_history ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS onboarding ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS speaking_sessions ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS chat_sessions ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS lesson_progress ALTER COLUMN student_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS vocabulary ALTER COLUMN student_id DROP NOT NULL"
            };

            for (String sql : legacyConstraints) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception e) {
                    logger.debug("[Schema Repair] Statement execution notice: {} - {}", sql, e.getMessage());
                }
            }

            // 2. Dynamically scan information_schema for ANY foreign key constraint referencing 'students' table and drop it
            try {
                String findFkSql = 
                    "SELECT tc.table_name, tc.constraint_name " +
                    "FROM information_schema.table_constraints tc " +
                    "JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name " +
                    "WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'students'";

                List<Map<String, Object>> fkRows = jdbcTemplate.queryForList(findFkSql);
                for (Map<String, Object> row : fkRows) {
                    String tableName = (String) row.get("table_name");
                    String constraintName = (String) row.get("constraint_name");
                    if (tableName != null && constraintName != null) {
                        try {
                            String dropSql = "ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constraintName;
                            jdbcTemplate.execute(dropSql);
                            logger.info("[Schema Repair] Dropped invalid constraint '{}' referencing 'students' on table '{}'", constraintName, tableName);
                        } catch (Exception ex) {
                            logger.warn("[Schema Repair] Could not drop constraint {}: {}", constraintName, ex.getMessage());
                        }
                    }
                }
            } catch (Exception ex) {
                logger.debug("[Schema Repair] Dynamic constraint scan notice: {}", ex.getMessage());
            }

            // 3. Ensure tables safely reference users(id)
            String[] targetTables = {
                "onboarding",
                "speaking_sessions",
                "chat_sessions",
                "lesson_progress",
                "vocabulary",
                "notification",
                "achievement",
                "progress",
                "settings",
                "grammar_history"
            };

            for (String table : targetTables) {
                try {
                    String fkName = "fk_" + table + "_users_repair";
                    // Check if table exists and user_id column exists
                    String checkColSql = 
                        "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_name = '" + table + "' AND column_name = 'user_id'";
                    Integer count = jdbcTemplate.queryForObject(checkColSql, Integer.class);

                    if (count != null && count > 0) {
                        // Check if a foreign key already points to users
                        String checkFkSql = 
                            "SELECT COUNT(*) FROM information_schema.table_constraints tc " +
                            "JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name " +
                            "WHERE tc.table_name = '" + table + "' AND ccu.table_name = 'users'";
                        Integer fkCount = jdbcTemplate.queryForObject(checkFkSql, Integer.class);

                        if (fkCount == null || fkCount == 0) {
                            String addFkSql = "ALTER TABLE " + table + " ADD CONSTRAINT " + fkName + 
                                              " FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE";
                            jdbcTemplate.execute(addFkSql);
                            logger.info("[Schema Repair] Added foreign key constraint '{}' on table '{}' referencing 'users(id)'", fkName, table);
                        }
                    }
                } catch (Exception ex) {
                    logger.debug("[Schema Repair] Table check/update notice for {}: {}", table, ex.getMessage());
                }
            }

            // 4. Ensure user_subscriptions table has all required columns and valid defaults
            String[] subscriptionColumnMigrations = {
                "CREATE TABLE IF NOT EXISTS user_subscriptions (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, plan_type VARCHAR(255) DEFAULT 'FREE', status VARCHAR(255) DEFAULT 'ACTIVE', amount NUMERIC(38,2), currency VARCHAR(255) DEFAULT 'INR', razorpay_order_id VARCHAR(255), razorpay_payment_id VARCHAR(255), razorpay_signature VARCHAR(255), start_date TIMESTAMP, end_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS plan_type VARCHAR(255) DEFAULT 'FREE'",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'ACTIVE'",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS amount NUMERIC(38,2)",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS currency VARCHAR(255) DEFAULT 'INR'",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255)",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE IF EXISTS user_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN amount_paid DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN subscription_plan_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN payment_status DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN subscription_status DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN payment_method DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN expiry_date DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN transaction_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN start_date DROP NOT NULL",
                "ALTER TABLE IF EXISTS user_subscriptions ALTER COLUMN end_date DROP NOT NULL"
            };

            for (String sql : subscriptionColumnMigrations) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ex) {
                    logger.debug("[Schema Repair] Subscription migration notice: {} - {}", sql, ex.getMessage());
                }
            }

            // 5. Ensure standard subscription plans exist (MONTHLY_PRO, YEARLY_PRO) and backfill unlinked user subscriptions
            String[] subscriptionPlanMigrations = {
                "INSERT INTO subscription_plans (plan_name, name, description, duration_months, price, currency, features, max_lessons, max_tests, ai_practice_limit, grammar_practice_limit, speaking_practice_limit, vocabulary_practice_limit, is_active, active, billing_cycle, created_at, updated_at) " +
                "SELECT 'FREE_STARTER', 'FREE_STARTER', 'Default Free Starter tier for all registered learners', 0, 0.00, 'INR', '15 mins Daily AI Speaking Practice, 15 Daily Grammar Doctor Checks, Core Vocabulary & Speech Tests', 5, 2, 15, 15, 15, 15, true, true, 'LIFETIME', NOW(), NOW() " +
                "WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE UPPER(plan_name) IN ('FREE_STARTER', 'FREE'))",

                "INSERT INTO subscription_plans (plan_name, name, description, duration_months, price, currency, features, max_lessons, max_tests, ai_practice_limit, grammar_practice_limit, speaking_practice_limit, vocabulary_practice_limit, is_active, active, billing_cycle, created_at, updated_at) " +
                "SELECT 'MONTHLY_PRO', 'MONTHLY_PRO', 'SpeakMate Pro 1 Month Pass', 1, 149.00, 'INR', 'Unlimited 24/7 AI Speaking, Unlimited Grammar Doctor, All 100+ Scenarios, All Neural Voices', 9999, 9999, 9999, 9999, 9999, 9999, true, true, 'MONTHLY', NOW(), NOW() " +
                "WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE UPPER(plan_name) = 'MONTHLY_PRO')",

                "INSERT INTO subscription_plans (plan_name, name, description, duration_months, price, currency, features, max_lessons, max_tests, ai_practice_limit, grammar_practice_limit, speaking_practice_limit, vocabulary_practice_limit, is_active, active, billing_cycle, created_at, updated_at) " +
                "SELECT 'YEARLY_PRO', 'YEARLY_PRO', 'SpeakMate Pro 1 Year Annual Pass', 12, 1199.00, 'INR', 'Unlimited 24/7 AI Speaking, Unlimited Grammar Doctor, All 100+ Scenarios, All Neural Voices, Official CEFR Certificate', 9999, 9999, 9999, 9999, 9999, 9999, true, true, 'YEARLY', NOW(), NOW() " +
                "WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE UPPER(plan_name) = 'YEARLY_PRO')",

                "UPDATE user_subscriptions " +
                "SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE UPPER(plan_name) = 'MONTHLY_PRO' LIMIT 1) " +
                "WHERE subscription_plan_id IS NULL AND (UPPER(plan_type) = 'MONTHLY_PRO' OR UPPER(plan_type) = 'MONTHLY')",

                "UPDATE user_subscriptions " +
                "SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE UPPER(plan_name) = 'YEARLY_PRO' LIMIT 1) " +
                "WHERE subscription_plan_id IS NULL AND (UPPER(plan_type) = 'YEARLY_PRO' OR UPPER(plan_type) = 'YEARLY')"
            };

            for (String sql : subscriptionPlanMigrations) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ex) {
                    logger.debug("[Schema Repair] Subscription plan migration notice: {} - {}", sql, ex.getMessage());
                }
            }

            logger.info("[Schema Repair] Database schema foreign key and subscription repair completed successfully!");
        } catch (Exception e) {
            logger.error("[Schema Repair] Unexpected error during schema repair: {}", e.getMessage(), e);
        }
    }
}
