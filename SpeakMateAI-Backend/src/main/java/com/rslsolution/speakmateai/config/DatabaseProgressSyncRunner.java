package com.rslsolution.speakmateai.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.rslsolution.speakmateai.service.ProgressService;

/**
 * Startup runner to automatically synchronize user progress, legitimate XP,
 * and speaking achievements directly in the database.
 * Runs on application startup (e.g., when deployed to Render) to ensure
 * all database records match completed speaking sessions.
 */
@Component
@Order(10)
public class DatabaseProgressSyncRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseProgressSyncRunner.class);

    private final ProgressService progressService;

    public DatabaseProgressSyncRunner(ProgressService progressService) {
        this.progressService = progressService;
    }

    private static volatile boolean hasExecuted = false;

    @Override
    public void run(String... args) {
        if (!hasExecuted) {
            hasExecuted = true;
            syncDatabaseProgress();
        }
    }

    public void syncDatabaseProgress() {
        logger.info("[Database Progress Sync] Checking and healing user progress and achievements...");
        try {
            Map<String, Object> result = progressService.recalculateAllUsers();
            logger.info("[Database Progress Sync] Completed successfully. Total users processed: {}, Users healed/updated: {}",
                    result.get("totalUsersProcessed"), result.get("usersUpdated"));
        } catch (Exception e) {
            logger.warn("[Database Progress Sync] Startup progress sync skipped or encountered an error (will retry or can be triggered via API): {}", e.getMessage());
        }
    }
}
