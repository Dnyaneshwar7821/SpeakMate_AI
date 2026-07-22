package com.rslsolution.speakmateai.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Settings;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.ExpoPushService;
import com.rslsolution.speakmateai.service.NotificationService;

/**
 * NotificationScheduler — Phase 2 automated reminders.
 *
 * Daily Practice Reminder : fires at 19:00 every day.
 * Streak Warning          : fires at 20:30 every day for users with an active
 *                           streak who have not practiced today.
 * Weekly Summary          : fires every Sunday at 09:00.
 *
 * All jobs respect the user's Settings:
 *   - notificationsEnabled = false → skip all notifications for that user
 *   - dailyReminder = false        → skip daily practice reminder only
 */
@Component
@Transactional
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final NotificationRepository notificationRepository;
    private final SettingsRepository settingsRepository;
    private final NotificationService notificationService;
    private final ExpoPushService expoPushService;

    public NotificationScheduler(UserRepository userRepository,
                                  ProgressRepository progressRepository,
                                  NotificationRepository notificationRepository,
                                  SettingsRepository settingsRepository,
                                  NotificationService notificationService,
                                  ExpoPushService expoPushService) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.notificationRepository = notificationRepository;
        this.settingsRepository = settingsRepository;
        this.notificationService = notificationService;
        this.expoPushService = expoPushService;
    }

    // ── Helper: fetch user settings safely ───────────────────────────

    private Settings getSettingsOrDefault(User user) {
        return settingsRepository.findByUser(user).orElse(null);
    }

    /** Returns true if the user has globally disabled notifications */
    private boolean isNotificationsDisabled(Settings settings) {
        if (settings == null) return false; // default = enabled
        return Boolean.FALSE.equals(settings.getNotificationsEnabled());
    }

    /** Returns true if the user has disabled daily reminder specifically */
    private boolean isDailyReminderDisabled(Settings settings) {
        if (settings == null) return false; // default = enabled
        return Boolean.FALSE.equals(settings.getDailyReminder());
    }

    // ── Daily Practice Reminder — 7:00 PM every day ───────────────────

    @Scheduled(cron = "0 0 19 * * ?")
    public void sendDailyPracticeReminder() {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (!user.isActive()) continue;

            Settings settings = getSettingsOrDefault(user);

            // Respect user preferences
            if (isNotificationsDisabled(settings)) continue;
            if (isDailyReminderDisabled(settings)) continue;

            // Avoid duplicating: check if a daily reminder was already sent today
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            boolean alreadySent = notificationRepository
                    .findByUserOrderByCreatedAtDesc(user)
                    .stream()
                    .anyMatch(n -> n.getTitle().startsWith("Daily Practice") &&
                                  n.getCreatedAt() != null &&
                                  n.getCreatedAt().isAfter(startOfDay));

            if (!alreadySent) {
                try {
                    String title = "Daily Practice Reminder \uD83D\uDCDA";
                    String body  = "Don't forget to practice your English today! Even 5 minutes makes a difference. Let's go!";
                    notificationService.createSystemNotification(user, title, body);
                    if (user.getExpoPushToken() != null) {
                        expoPushService.sendPush(user.getExpoPushToken(), title, body);
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    // ── Streak Break Warning — 8:30 PM every day ─────────────────────

    @Scheduled(cron = "0 30 20 * * ?")
    public void sendStreakWarning() {
        List<Progress> activeStreaks = progressRepository.findByCurrentStreakGreaterThan(0);

        for (Progress progress : activeStreaks) {
            User user = progress.getUser();
            if (user == null || !user.isActive()) continue;

            Settings settings = getSettingsOrDefault(user);

            // Respect global notifications toggle
            if (isNotificationsDisabled(settings)) continue;

            // Check if already warned today
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            boolean alreadyWarned = notificationRepository
                    .findByUserOrderByCreatedAtDesc(user)
                    .stream()
                    .anyMatch(n -> n.getTitle().contains("Streak") &&
                                  n.getTitle().contains("Risk") &&
                                  n.getCreatedAt() != null &&
                                  n.getCreatedAt().isAfter(startOfDay));

            if (!alreadyWarned) {
                try {
                    String title = "Your Streak is at Risk! \uD83D\uDD25";
                    String body  = "You have a " + progress.getCurrentStreak() + "-day streak! "
                            + "Practice something tonight to keep it alive before midnight.";
                    notificationService.createSystemNotification(user, title, body);
                    if (user.getExpoPushToken() != null) {
                        expoPushService.sendPush(user.getExpoPushToken(), title, body);
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    // ── Weekly Progress Summary — Every Sunday at 9:00 AM ─────────────

    @Scheduled(cron = "0 0 9 ? * SUN")
    public void sendWeeklySummary() {
        List<Progress> allProgress = progressRepository.findAll();
        for (Progress progress : allProgress) {
            User user = progress.getUser();
            if (user == null || !user.isActive()) continue;

            Settings settings = getSettingsOrDefault(user);

            // Respect global notifications toggle
            if (isNotificationsDisabled(settings)) continue;

            int totalXp  = progress.getXp() != null ? progress.getXp() : 0;
            int level    = progress.getLevel() != null ? progress.getLevel() : 1;
            int streak   = progress.getCurrentStreak() != null ? progress.getCurrentStreak() : 0;
            int sessions = progress.getTotalSpeakingSessions() != null ? progress.getTotalSpeakingSessions() : 0;
            int minutes  = progress.getTotalPracticeMinutes() != null ? progress.getTotalPracticeMinutes() : 0;

            String summary = String.format(
                "Level %d | %d XP | %d-day streak | %d sessions | %d mins practiced total. Keep pushing!",
                level, totalXp, streak, sessions, minutes);

            try {
                String title = "Weekly Progress Summary \uD83D\uDCC8";
                notificationService.createSystemNotification(user, title, summary);
                if (user.getExpoPushToken() != null) {
                    expoPushService.sendPush(user.getExpoPushToken(), title, summary);
                }
            } catch (Exception ignored) {}
        }
    }
}
