package com.rslsolution.speakmateai.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Comparator;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.AdminUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminUserUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminUserResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;
import com.rslsolution.speakmateai.dto.request.AdminUserDetailsUpdateRequest;
import com.rslsolution.speakmateai.dto.response.LanguageScoreResponse;
import com.rslsolution.speakmateai.dto.response.UserActivityResponse;
import com.rslsolution.speakmateai.dto.response.UserDetailsResponse;
import com.rslsolution.speakmateai.dto.response.UserGrammarResponse;
import com.rslsolution.speakmateai.dto.response.UserLearningStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserProgressResponse;
import com.rslsolution.speakmateai.dto.response.UserSpeakingResponse;
import com.rslsolution.speakmateai.dto.response.UserVocabularyResponse;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.Vocabulary;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.mapper.AdminUserMapper;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSpecification;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.service.AdminUserService;

@Service
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final ProgressRepository progressRepository;
    private final SpeakingSessionRepository speakingSessionRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final com.rslsolution.speakmateai.repository.GrammarHistoryRepository grammarHistoryRepository;
    private final com.rslsolution.speakmateai.repository.VocabularyRepository vocabularyRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.EmailService emailService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.email.EmailTemplateService emailTemplateService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.EntityCascadeDeletionService entityCascadeDeletionService;

    public AdminUserServiceImpl(UserRepository userRepository, AdminUserMapper adminUserMapper,
            PasswordEncoder passwordEncoder,
            ProgressRepository progressRepository, SpeakingSessionRepository speakingSessionRepository,
            UserSubscriptionRepository userSubscriptionRepository,
            com.rslsolution.speakmateai.repository.GrammarHistoryRepository grammarHistoryRepository,
            com.rslsolution.speakmateai.repository.VocabularyRepository vocabularyRepository) {
        this.userRepository = userRepository;
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.progressRepository = progressRepository;
        this.speakingSessionRepository = speakingSessionRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.grammarHistoryRepository = grammarHistoryRepository;
        this.vocabularyRepository = vocabularyRepository;
    }

    @Override
    public Page<AdminUserResponse> getAllUsers(int page, int size, String sortBy, String sortDir,
            String keyword, Boolean status, String englishLevel,
            String nativeLanguage, String purpose,
            LocalDateTime registrationFrom, LocalDateTime registrationTo) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<User> spec = UserSpecification.filterUsers(keyword, status, englishLevel,
                nativeLanguage, purpose,
                registrationFrom, registrationTo);

        return userRepository.findAll(spec, pageable).map(adminUserMapper::mapToListResponse);
    }

    @Override
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Creating a standard user for now (or a Student if we need to).
        // Since AdminUserCreateRequest is generic, we just create User.
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setActive(request.isActive());

        user.setEnglishLevel(request.getEnglishLevel());
        user.setNativeLanguage(request.getNativeLanguage());
        user.setLearningGoal(request.getLearningGoal());
        user.setDailyGoalMinutes(request.getDailyGoalMinutes());
        user.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Phone number"));

        User savedUser = userRepository.save(user);

        if (notificationService != null) {
            try {
                String userName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
                notificationService.notifyAdmins("New User Registered", "User " + userName + " (" + savedUser.getEmail() + ") has joined the platform.", com.rslsolution.speakmateai.enums.NotificationType.USER_CREATED, savedUser.getId(), "USER");
                notificationService.sendNotification(savedUser.getEmail(), "Welcome to SpeakMate AI", "Your account has been created successfully. Welcome aboard!", com.rslsolution.speakmateai.enums.NotificationType.USER_CREATED, savedUser.getId(), "USER");
            } catch (Exception ignored) {}
        }

        if (emailService != null && savedUser.getEmail() != null && !savedUser.getEmail().isBlank()) {
            try {
                String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                        ? request.getPassword()
                        : "defaultPassword123!";
                String userName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " "
                        + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
                String subject = "Welcome to SpeakMate AI - Your Account Credentials";

                if (emailTemplateService != null) {
                    String html = emailTemplateService.buildUserWelcomeEmailHtml(
                            userName,
                            savedUser.getEmail(),
                            rawPassword,
                            savedUser.getEnglishLevel() != null ? savedUser.getEnglishLevel() : "N/A",
                            savedUser.getLearningGoal() != null ? savedUser.getLearningGoal() : "N/A"
                    );
                    String text = emailTemplateService.buildUserWelcomeEmailText(
                            userName,
                            savedUser.getEmail(),
                            rawPassword,
                            savedUser.getEnglishLevel() != null ? savedUser.getEnglishLevel() : "N/A",
                            savedUser.getLearningGoal() != null ? savedUser.getLearningGoal() : "N/A"
                    );
                    emailService.sendHtmlEmail(savedUser.getEmail(), subject, html, text);
                } else {
                    String text = "Hello " + (userName.isEmpty() ? "User" : userName) + ",\n\n"
                            + "Your account has been created on SpeakMate AI.\n\n"
                            + "Here are your login credentials:\n"
                            + "--------------------------------------------------\n"
                            + "Email:    " + savedUser.getEmail() + "\n"
                            + "Password: " + rawPassword + "\n"
                            + "--------------------------------------------------\n\n"
                            + "You can now log in to SpeakMate AI and start learning!\n\n"
                            + "Best regards,\n"
                            + "SpeakMate AI Team";
                    emailService.sendEmail(savedUser.getEmail(), subject, text);
                }
            } catch (Exception e) {
                System.err.println("Failed to dispatch user credentials email to " + savedUser.getEmail() + ": " + e.getMessage());
            }
        }

        return adminUserMapper.mapToDetailResponse(savedUser);
    }

    @Override
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return adminUserMapper.mapToDetailResponse(user);
    }

    @Override
    public AdminUserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Validate email uniqueness ignoring current user
        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(user.getId())) {
                throw new IllegalArgumentException("Email is already in use by another user");
            }
        });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        if (request.getPhone() != null) {
            user.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Phone number"));
        }
        user.setEnglishLevel(request.getEnglishLevel());
        user.setNativeLanguage(request.getNativeLanguage());
        user.setLearningGoal(request.getLearningGoal());
        user.setDailyGoalMinutes(request.getDailyGoalMinutes());
        user.setAvatar(request.getAvatar());
        user.setPreferredVoice(request.getPreferredVoice());
        user.setPreferredAccent(request.getPreferredAccent());
        user.setAgeGroup(request.getAgeGroup());
        user.setActive(request.isActive());

        return adminUserMapper.mapToDetailResponse(userRepository.save(user));
    }

    @Override
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setActive(true);
        User savedUser = userRepository.save(user);

        if (notificationService != null) {
            String userName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                    (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
            if (userName.isEmpty()) {
                userName = savedUser.getEmail() != null ? savedUser.getEmail() : "User";
            }
            try {
                notificationService.notifyAdmins(
                        "User Activated",
                        "User " + userName + " (" + savedUser.getEmail() + ") has been activated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.USER_UPDATED,
                        savedUser.getId(),
                        "USER"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on activate user: " + e.getMessage());
            }

            if (savedUser.getSchoolId() != null) {
                try {
                    notificationService.notifySchoolAdmins(
                            savedUser.getSchoolId(),
                            "User Activated",
                            "User " + userName + " has been activated by Super Admin.",
                            com.rslsolution.speakmateai.enums.NotificationType.USER_UPDATED,
                            savedUser.getId(),
                            "USER"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to dispatch school admin notification on activate user: " + e.getMessage());
                }
            }
        }
    }

    @Override
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setActive(false);
        User savedUser = userRepository.save(user);

        if (notificationService != null) {
            String userName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                    (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
            if (userName.isEmpty()) {
                userName = savedUser.getEmail() != null ? savedUser.getEmail() : "User";
            }
            try {
                notificationService.notifyAdmins(
                        "User Deactivated",
                        "User " + userName + " (" + savedUser.getEmail() + ") has been deactivated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.USER_UPDATED,
                        savedUser.getId(),
                        "USER"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on deactivate user: " + e.getMessage());
            }

            if (savedUser.getSchoolId() != null) {
                try {
                    notificationService.notifySchoolAdmins(
                            savedUser.getSchoolId(),
                            "User Deactivated",
                            "User " + userName + " has been deactivated by Super Admin.",
                            com.rslsolution.speakmateai.enums.NotificationType.USER_UPDATED,
                            savedUser.getId(),
                            "USER"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to dispatch school admin notification on deactivate user: " + e.getMessage());
                }
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        if (entityCascadeDeletionService != null) {
            entityCascadeDeletionService.deleteStudentCascade(id);
        } else {
            userRepository.delete(user);
        }
    }

    @Override
    public String exportUsersCsv() {
        List<User> users = userRepository.findAll();
        users.sort(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        StringBuilder csv = new StringBuilder();

        // Headers
        csv.append(
                "ID,First Name,Last Name,Email,Role,Status,Native Language,English Level,Learning Goal,Created At\n");

        for (User user : users) {
            csv.append(user.getId()).append(",");
            csv.append(escapeCsv(user.getFirstName())).append(",");
            csv.append(escapeCsv(user.getLastName())).append(",");
            csv.append(escapeCsv(user.getEmail())).append(",");
            csv.append(user.getRole().name()).append(",");
            csv.append(user.isActive() ? "Active" : "Inactive").append(",");
            csv.append(escapeCsv(user.getNativeLanguage())).append(",");
            csv.append(escapeCsv(user.getEnglishLevel())).append(",");
            csv.append(escapeCsv(user.getLearningGoal())).append(",");
            csv.append(user.getCreatedAt()).append("\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    @Override
    public UserStatisticsResponse getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long inactiveUsers = userRepository.countByActiveFalse();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);

        long todayRegistrations = userRepository.countByCreatedAtBetween(startOfDay, now);
        long thisWeekRegistrations = userRepository.countByCreatedAtBetween(startOfWeek, now);
        long thisMonthRegistrations = userRepository.countByCreatedAtBetween(startOfMonth, now);

        long premiumUsers = userSubscriptionRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE);
        double averageLearningTimeMinutes = progressRepository.getAveragePracticeMinutes();
        double averageSpeakingScore = speakingSessionRepository.getAverageSpeakingScore();

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .todayRegistrations(todayRegistrations)
                .thisWeekRegistrations(thisWeekRegistrations)
                .thisMonthRegistrations(thisMonthRegistrations)
                .premiumUsers(premiumUsers)
                .averageLearningTimeMinutes(Math.round(averageLearningTimeMinutes * 10.0) / 10.0)
                .averageSpeakingScore(Math.round(averageSpeakingScore * 10.0) / 10.0)
                .build();
    }

    @Override
    public UserDetailsResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Progress progress = null;
        if (user instanceof Student student) {
            progress = student.getProgressList() != null && !student.getProgressList().isEmpty()
                    ? student.getProgressList().get(0)
                    : null;
        }

        return UserDetailsResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .accountType(user.getUserType() != null ? user.getUserType().name() : "STANDARD")
                .englishLevel(user.getEnglishLevel())
                .status(user.isActive() ? "Active" : "Inactive")
                .registrationDate(user.getCreatedAt())
                .lastActive(user.getUpdatedAt())
                .xp(progress != null && progress.getXp() != null ? progress.getXp() : 0)
                .currentStreak(
                        progress != null && progress.getCurrentStreak() != null ? progress.getCurrentStreak() : 0)
                .build();
    }

    @Override
    public UserLearningStatisticsResponse getUserLearningStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Progress progress = user.getProgress();

        int totalSpeaking = 0;
        int aiChats = 0;
        int completedLessons = 0;
        double practiceHours = 0;
        int currentStreak = 0;
        int xp = 0;

        if (user instanceof Student student) {
            progress = student.getProgressList() != null && !student.getProgressList().isEmpty()
                    ? student.getProgressList().get(0)
                    : progress;

            totalSpeaking = student.getSpeakingSessions() != null ? student.getSpeakingSessions().size() : 0;
            aiChats = student.getChatSessions() != null ? student.getChatSessions().size() : 0;

            if (student.getLessonProgresses() != null) {
                completedLessons = (int) student.getLessonProgresses().stream()
                        .filter(lp -> lp.getCompleted() != null && lp.getCompleted()).count();
            }
        }

        if (progress != null) {
            if (progress.getTotalPracticeMinutes() != null) {
                practiceHours = progress.getTotalPracticeMinutes() / 60.0;
            }
            currentStreak = progress.getCurrentStreak() != null ? progress.getCurrentStreak() : 0;
            xp = progress.getXp() != null ? progress.getXp() : 0;
        }

        return UserLearningStatisticsResponse.builder()
                .practiceHours(Math.round(practiceHours * 10.0) / 10.0)
                .speakingSessions(totalSpeaking)
                .aiChats(aiChats)
                .completedLessons(completedLessons)
                .currentStreak(currentStreak)
                .xp(xp)
                .build();
    }

    @Override
    public LanguageScoreResponse getLanguageScores(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        double avgGrammar = 0;
        double avgFluency = 0;
        double avgPronunciation = 0;
        double avgVocabulary = 0.0;

        List<GrammarHistory> grammars = grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        if (grammars != null && !grammars.isEmpty()) {
            avgGrammar = grammars.stream()
                    .filter(g -> g.getGrammarScore() != null)
                    .mapToDouble(GrammarHistory::getGrammarScore)
                    .average().orElse(0.0);
        }

        List<SpeakingSession> sessions = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
        if (sessions != null && !sessions.isEmpty()) {
            avgFluency = sessions.stream()
                    .filter(s -> s.getFluencyScore() != null)
                    .mapToDouble(SpeakingSession::getFluencyScore)
                    .average().orElse(0.0);
            avgPronunciation = sessions.stream()
                    .filter(s -> s.getPronunciationScore() != null)
                    .mapToDouble(SpeakingSession::getPronunciationScore)
                    .average().orElse(0.0);
        }

        List<Vocabulary> vocabs = vocabularyRepository.findByUser(user);
        if (vocabs != null && !vocabs.isEmpty()) {
            long mastered = vocabs.stream().filter(v -> Boolean.TRUE.equals(v.getFavorite())).count();
            avgVocabulary = ((double) mastered / vocabs.size()) * 100.0;
        }

        return LanguageScoreResponse.builder()
                .grammarScore(Math.round(avgGrammar * 10.0) / 10.0)
                .vocabularyScore(Math.round(avgVocabulary * 10.0) / 10.0)
                .fluencyScore(Math.round(avgFluency * 10.0) / 10.0)
                .pronunciationScore(Math.round(avgPronunciation * 10.0) / 10.0)
                .build();
    }

    @Override
    public Page<UserActivityResponse> getUserActivities(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<UserActivityResponse> allActivities = new ArrayList<>();

        if (user.getLessonProgresses() != null) {
            for (LessonProgress lp : user.getLessonProgresses()) {
                allActivities.add(UserActivityResponse.builder()
                        .activityType("LESSON")
                        .title(lp.getLesson() != null ? lp.getLesson().getTitle() : "Unknown Lesson")
                        .description("Lesson Practice")
                        .activityDate(lp.getUpdatedAt() != null ? lp.getUpdatedAt() : lp.getCreatedAt())
                        .status(lp.getCompleted() != null && lp.getCompleted() ? "COMPLETED" : "IN_PROGRESS")
                        .build());
            }
        }

        List<SpeakingSession> userSessions = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
        if (userSessions != null) {
            for (SpeakingSession ss : userSessions) {
                allActivities.add(UserActivityResponse.builder()
                        .activityType("SPEAKING")
                        .title(ss.getTopic() != null ? ss.getTopic() : "Speaking Session")
                        .description("Speaking Practice")
                        .activityDate(ss.getCreatedAt())
                        .status("COMPLETED")
                        .build());
            }
        }

        allActivities.sort(Comparator.comparing(UserActivityResponse::getActivityDate).reversed());

        int start = Math.min(page * size, allActivities.size());
        int end = Math.min((page + 1) * size, allActivities.size());

        return new PageImpl<>(allActivities.subList(start, end), PageRequest.of(page, size), allActivities.size());
    }

    @Override
    public UserProgressResponse getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        int lessonsCompleted = 0;
        int testsCompleted = 0;
        double completionPercent = 0.0;
        int totalLearningHours = 0;

        if (user.getLessonProgresses() != null && !user.getLessonProgresses().isEmpty()) {
            lessonsCompleted = (int) user.getLessonProgresses().stream()
                    .filter(lp -> lp.getCompleted() != null && lp.getCompleted()).count();
            completionPercent = user.getLessonProgresses().stream().filter(lp -> lp.getProgressPercent() != null)
                    .mapToDouble(LessonProgress::getProgressPercent).average().orElse(0.0);
        }

        Progress progress = progressRepository.findByUser(user).orElse(null);

        totalLearningHours = progress != null && progress.getTotalPracticeMinutes() != null
                ? progress.getTotalPracticeMinutes() / 60
                : 0;

        return UserProgressResponse.builder()
                .overallProgress((int) completionPercent)
                .lessonsCompleted(lessonsCompleted)
                .testsCompleted(testsCompleted)
                .totalLearningHours(totalLearningHours)
                .completionPercentage(Math.round(completionPercent * 10.0) / 10.0)
                .weeklyProgress(0) // Default for now
                .build();
    }

    @Override
    public UserSpeakingResponse getUserSpeakingDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        int totalSessions = 0;
        double avgScore = 0.0;
        int totalMinutes = 0;
        LocalDateTime lastDate = null;
        double bestScore = 0.0;

        List<SpeakingSession> sessions = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
        if (sessions != null && !sessions.isEmpty()) {
            totalSessions = sessions.size();
            avgScore = sessions.stream().filter(s -> s.getScore() != null)
                    .mapToDouble(SpeakingSession::getScore).average().orElse(0.0);
            bestScore = sessions.stream().filter(s -> s.getScore() != null)
                    .mapToDouble(SpeakingSession::getScore).max().orElse(0.0);
            totalMinutes = sessions.stream().filter(s -> s.getDuration() != null)
                    .mapToInt(SpeakingSession::getDuration).sum() / 60;
            lastDate = sessions.stream().map(SpeakingSession::getCreatedAt)
                    .max(LocalDateTime::compareTo).orElse(null);
        }

        return UserSpeakingResponse.builder()
                .totalSpeakingSessions(totalSessions)
                .averageSpeakingScore(Math.round(avgScore * 10.0) / 10.0)
                .totalSpeakingMinutes(totalMinutes)
                .lastSpeakingDate(lastDate)
                .bestSpeakingScore(bestScore)
                .build();
    }

    @Override
    public UserGrammarResponse getUserGrammarDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        int exercises = 0;
        double accuracy = 0.0;
        int totalMistakes = 0;
        double improvementPercentage = 0.0;

        List<GrammarHistory> histories = grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        if (histories != null && !histories.isEmpty()) {
            exercises = histories.size();
            accuracy = histories.stream().filter(g -> g.getGrammarScore() != null)
                    .mapToDouble(GrammarHistory::getGrammarScore).average().orElse(0.0);
            totalMistakes = 0; // Not stored as a raw column in DB
        }

        return UserGrammarResponse.builder()
                .exercisesCompleted(exercises)
                .accuracy(Math.round(accuracy * 10.0) / 10.0)
                .totalMistakes(totalMistakes)
                .improvementPercentage(Math.round(improvementPercentage * 10.0) / 10.0)
                .build();
    }

    @Override
    public UserVocabularyResponse getUserVocabularyDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        int wordsLearned = 0;
        int mastered = 0;
        int pending = 0;
        double score = 0.0;

        List<Vocabulary> vocabList = vocabularyRepository.findByUser(user);
        if (vocabList != null && !vocabList.isEmpty()) {
            wordsLearned = vocabList.size();
            mastered = (int) vocabList.stream().filter(v -> Boolean.TRUE.equals(v.getFavorite())).count();
            pending = wordsLearned - mastered;
            score = 0.0;
        }

        return UserVocabularyResponse.builder()
                .wordsLearned(wordsLearned)
                .masteredWords(mastered)
                .pendingRevision(pending)
                .vocabularyScore(Math.round(score * 10.0) / 10.0)
                .build();
    }

    @Override
    public UserDetailsResponse updateUserDetails(Long userId, AdminUserDetailsUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Phone number"));
        user.setEnglishLevel(request.getEnglishLevel());
        user.setActive(request.isActive());

        userRepository.save(user);

        return getUserDetails(userId);
    }
}
