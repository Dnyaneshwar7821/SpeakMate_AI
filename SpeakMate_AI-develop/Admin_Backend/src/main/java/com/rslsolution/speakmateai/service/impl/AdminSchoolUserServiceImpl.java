package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.AdminSchoolUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminSchoolUserUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminSchoolUserResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.UserType;
import com.rslsolution.speakmateai.repository.SchoolUserSpecification;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.AdminSchoolUserService;

@Service
@Transactional
public class AdminSchoolUserServiceImpl implements AdminSchoolUserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.rslsolution.speakmateai.service.NotificationService notificationService;
    private final com.rslsolution.speakmateai.service.SchoolTeacherService schoolTeacherService;
    private final com.rslsolution.speakmateai.repository.SchoolRepository schoolRepository;
    private final com.rslsolution.speakmateai.service.EmailService emailService;

    @org.springframework.beans.factory.annotation.Autowired
    public AdminSchoolUserServiceImpl(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.rslsolution.speakmateai.service.NotificationService notificationService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.rslsolution.speakmateai.service.SchoolTeacherService schoolTeacherService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.rslsolution.speakmateai.repository.SchoolRepository schoolRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.rslsolution.speakmateai.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.schoolTeacherService = schoolTeacherService;
        this.schoolRepository = schoolRepository;
        this.emailService = emailService;
    }

    public AdminSchoolUserServiceImpl(UserRepository userRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, studentRepository, passwordEncoder, null, null, null, null);
    }

    private AdminSchoolUserResponse mapToListResponse(Student user) {
        if (user == null) {
            return null;
        }

        Long teacherId = user.getTeacherId();
        String assignedTeacher = null;

        if (teacherId != null) {
            com.rslsolution.speakmateai.entity.User t = userRepository.findById(teacherId).orElse(null);
            if (t != null) {
                assignedTeacher = (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
            }
        }

        if (assignedTeacher == null && schoolTeacherService != null && user.getStandard() != null && user.getDivision() != null) {
            Long schoolId = user.getSchoolId();
            if (schoolId == null && user.getSchoolName() != null && schoolRepository != null) {
                schoolId = schoolRepository.findByName(user.getSchoolName()).map(com.rslsolution.speakmateai.entity.School::getId).orElse(null);
            }
            if (schoolId != null) {
                try {
                    com.rslsolution.speakmateai.dto.response.SchoolTeacherResponse resp = schoolTeacherService.getAssignedTeacher(schoolId, user.getStandard(), user.getDivision());
                    if (resp != null) {
                        teacherId = resp.getId();
                        assignedTeacher = (resp.getFirstName() + " " + (resp.getLastName() != null ? resp.getLastName() : "")).trim();
                    }
                } catch (Exception ignored) {
                }
            }
        }

        return AdminSchoolUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .schoolName(user.getSchoolName())
                .standard(user.getStandard())
                .division(user.getDivision())
                .rollNumber(user.getRollNumber())
                .parentName(user.getParentName())
                .parentPhone(user.getParentPhone())
                .teacherId(teacherId)
                .assignedTeacher(assignedTeacher)
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminSchoolUserResponse mapToDetailResponse(Student user) {
        AdminSchoolUserResponse response = mapToListResponse(user);
        if (response == null) {
            return null;
        }

        // Calculate statistics using repository count queries only for the single detailed view
        response.setTotalLessonsCompleted(userRepository.countLessonProgressByUserId(user.getId()));
        response.setTotalSpeakingSessions(userRepository.countSpeakingSessionsByUserId(user.getId()));
        response.setTotalGrammarSessions(userRepository.countGrammarHistoriesByUserId(user.getId()));
        response.setTotalVocabularySaved(userRepository.countVocabularyByUserId(user.getId()));

        return response;
    }

    private AdminSchoolUserResponse mapToResponse(Student user) {
        return mapToDetailResponse(user);
    }

    @Override
    public Page<AdminSchoolUserResponse> getAllSchoolUsers(int page, int size, String sortBy, String sortDir, 
                                                           String keyword, String standard, String division, String schoolName, 
                                                           Boolean status, LocalDateTime registrationFrom, LocalDateTime registrationTo) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Student> spec = SchoolUserSpecification.filterSchoolUsers(keyword, standard, division, schoolName, status, registrationFrom, registrationTo);

        Page<Student> users = studentRepository.findAll(spec, pageable);
        return users.map(this::mapToListResponse);
    }

    private boolean isSchoolUser(Student user) {
        return user != null && (user.getUserType() == UserType.SCHOOL || user.getRole() == Role.STUDENT || user.getSchoolId() != null);
    }

    @Override
    public AdminSchoolUserResponse getSchoolUserById(Long id) {
        Student user = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School User not found with id: " + id));
        
        if (!isSchoolUser(user)) {
            throw new IllegalArgumentException("User found, but is not a school user.");
        }
        
        return mapToDetailResponse(user);
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.email.EmailTemplateService emailTemplateService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.EntityCascadeDeletionService entityCascadeDeletionService;

    @Override
    public AdminSchoolUserResponse createSchoolUser(AdminSchoolUserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.rslsolution.speakmateai.exception.DuplicateEmailException("An account with email '" + request.getEmail() + "' already exists. Please use a different email address.");
        }
        
        Student user = new Student();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT); // Canonical backend role for school students
        user.setUserType(UserType.SCHOOL);
        user.setActive(request.isActive());
        if (user.getStudentId() == null || user.getStudentId().isBlank()) {
            user.setStudentId(String.format("STU-2026-%04d", new java.util.Random().nextInt(10000)));
        }
        
        user.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Student phone"));
        user.setSchoolName(request.getSchoolName());
        user.setStandard(request.getStandard());
        user.setDivision(request.getDivision());
        user.setRollNumber(request.getRollNumber());
        user.setParentName(request.getParentName());
        user.setParentPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getParentPhone(), "Parent phone"));
        user.setTeacherId(request.getTeacherId());

        if (request.getSchoolName() != null && !request.getSchoolName().isBlank() && schoolRepository != null) {
            String sName = request.getSchoolName().trim();
            schoolRepository.findByName(sName)
                    .ifPresent(s -> user.setSchoolId(s.getId()));
        }
        
        Student savedUser = studentRepository.save(user);

        if (notificationService != null) {
            try {
                String studentName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
                String schoolInfo = savedUser.getSchoolName() != null ? " at " + savedUser.getSchoolName() : "";
                notificationService.notifyAdmins("New Student Added", "Student " + studentName + schoolInfo + " has been registered.", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_CREATED, savedUser.getId(), "STUDENT");
                notificationService.sendNotification(savedUser.getEmail(), "Welcome to SpeakMate AI", "Your student account" + schoolInfo + " is now ready. Start learning!", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_CREATED, savedUser.getId(), "STUDENT");
                if (savedUser.getSchoolId() != null) {
                    notificationService.notifySchoolAdmins(savedUser.getSchoolId(), "New Student Added", "Student " + studentName + " (Std " + savedUser.getStandard() + " - " + savedUser.getDivision() + ") has been registered.", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_CREATED, savedUser.getId(), "STUDENT");
                }
            } catch (Exception ignored) {}
        }

        if (emailService != null && savedUser.getEmail() != null && !savedUser.getEmail().isBlank()) {
            try {
                String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                        ? request.getPassword()
                        : "defaultPassword123!";
                String studentName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " "
                        + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
                String schoolName = (savedUser.getSchoolName() != null && !savedUser.getSchoolName().isBlank())
                        ? savedUser.getSchoolName()
                        : "Your School";

                String schoolCode = "N/A";
                if (savedUser.getSchoolId() != null && schoolRepository != null) {
                    schoolCode = schoolRepository.findById(savedUser.getSchoolId())
                            .map(s -> s.getSchoolCode() != null && !s.getSchoolCode().isBlank() ? s.getSchoolCode() : "N/A")
                            .orElse("N/A");
                } else if (savedUser.getSchoolName() != null && schoolRepository != null) {
                    schoolCode = schoolRepository.findByName(savedUser.getSchoolName())
                            .map(s -> s.getSchoolCode() != null && !s.getSchoolCode().isBlank() ? s.getSchoolCode() : "N/A")
                            .orElse("N/A");
                }

                String rollNumber = (savedUser.getRollNumber() != null && !savedUser.getRollNumber().isBlank())
                        ? savedUser.getRollNumber()
                        : "N/A";

                Long teacherId = savedUser.getTeacherId();
                String assignedTeacher = null;
                if (teacherId != null && userRepository != null) {
                    com.rslsolution.speakmateai.entity.User t = userRepository.findById(teacherId).orElse(null);
                    if (t != null) {
                        assignedTeacher = (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
                    }
                }

                if ((assignedTeacher == null || assignedTeacher.isBlank()) && schoolTeacherService != null && savedUser.getStandard() != null && savedUser.getDivision() != null) {
                    Long targetSchoolId = savedUser.getSchoolId();
                    if (targetSchoolId == null && savedUser.getSchoolName() != null && schoolRepository != null) {
                        targetSchoolId = schoolRepository.findByName(savedUser.getSchoolName()).map(com.rslsolution.speakmateai.entity.School::getId).orElse(null);
                    }
                    if (targetSchoolId != null) {
                        try {
                            com.rslsolution.speakmateai.dto.response.SchoolTeacherResponse resp = schoolTeacherService.getAssignedTeacher(targetSchoolId, savedUser.getStandard(), savedUser.getDivision());
                            if (resp != null) {
                                assignedTeacher = (resp.getFirstName() + " " + (resp.getLastName() != null ? resp.getLastName() : "")).trim();
                            }
                        } catch (Exception ignored) {}
                    }
                }

                if (assignedTeacher == null || assignedTeacher.isBlank()) {
                    assignedTeacher = "Assigned by School";
                }

                String subject = "Welcome to SpeakMate AI - Student Account Credentials";

                if (emailTemplateService != null) {
                    String html = emailTemplateService.buildStudentWelcomeEmailHtml(
                            studentName,
                            savedUser.getEmail(),
                            rawPassword,
                            schoolName,
                            schoolCode,
                            savedUser.getStandard(),
                            savedUser.getDivision(),
                            rollNumber,
                            assignedTeacher
                    );
                    String text = emailTemplateService.buildStudentWelcomeEmailText(
                            studentName,
                            savedUser.getEmail(),
                            rawPassword,
                            schoolName,
                            schoolCode,
                            savedUser.getStandard(),
                            savedUser.getDivision(),
                            rollNumber,
                            assignedTeacher
                    );
                    emailService.sendHtmlEmail(savedUser.getEmail(), subject, html, text);
                } else {
                    String text = "Hello " + (studentName.isEmpty() ? "Student" : studentName) + ",\n\n"
                            + "Your student account for " + schoolName + " has been created on SpeakMate AI.\n\n"
                            + "School Code: " + schoolCode + "\n"
                            + "Roll Number: " + rollNumber + "\n"
                            + "Teacher:     " + assignedTeacher + "\n\n"
                            + "Here are your login credentials:\n"
                            + "--------------------------------------------------\n"
                            + "Email:    " + savedUser.getEmail() + "\n"
                            + "Password: " + rawPassword + "\n"
                            + "--------------------------------------------------\n\n"
                            + "Best regards,\nSpeakMate AI Team";
                    emailService.sendEmail(savedUser.getEmail(), subject, text);
                }
            } catch (Exception e) {
                System.err.println("Failed to dispatch student credentials email to " + savedUser.getEmail() + ": " + e.getMessage());
            }
        }

        return mapToResponse(savedUser);
    }

    @Override
    public AdminSchoolUserResponse updateSchoolUser(Long id, AdminSchoolUserUpdateRequest request) {
        Student user = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School User not found with id: " + id));
                
        if (!isSchoolUser(user)) {
            throw new IllegalArgumentException("User found, but is not a school user.");
        }

        // Normalize school student role and userType systematically on update
        user.setRole(Role.STUDENT);
        user.setUserType(UserType.SCHOOL);

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getPhone(), "Student phone"));
        user.setSchoolName(request.getSchoolName());
        user.setStandard(request.getStandard());
        user.setDivision(request.getDivision());
        user.setRollNumber(request.getRollNumber());
        user.setParentName(request.getParentName());
        user.setParentPhone(com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getParentPhone(), "Parent phone"));
        if (request.getTeacherId() != null) {
            user.setTeacherId(request.getTeacherId());
        }
        if (request.getSchoolName() != null && !request.getSchoolName().isBlank() && schoolRepository != null) {
            String sName = request.getSchoolName().trim();
            schoolRepository.findByName(sName)
                    .ifPresent(s -> user.setSchoolId(s.getId()));
        }
        
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        Student savedUser = studentRepository.save(user);

        if (notificationService != null && savedUser.getSchoolId() != null) {
            try {
                String studentName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
                notificationService.notifySchoolAdmins(savedUser.getSchoolId(), "Student Updated", "Student " + studentName + " details have been updated by Super Admin.", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_UPDATED, savedUser.getId(), "STUDENT");
            } catch (Exception ignored) {}
        }

        return mapToResponse(savedUser);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteSchoolUser(Long id) {
        Student user = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School User not found with id: " + id));
        
        if (!isSchoolUser(user)) {
            throw new IllegalArgumentException("User found, but is not a school user.");
        }

        Long schoolId = user.getSchoolId();
        String studentName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
        
        if (entityCascadeDeletionService != null) {
            entityCascadeDeletionService.deleteStudentCascade(id);
        } else {
            studentRepository.delete(user);
            userRepository.deleteById(id);
        }

        if (notificationService != null && schoolId != null) {
            try {
                notificationService.notifySchoolAdmins(schoolId, "Student Removed", "Student " + studentName + " has been removed by Super Admin.", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_DELETED, id, "STUDENT");
            } catch (Exception ignored) {}
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public AdminSchoolUserResponse activateStudent(Long id) {
        Student user = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School User not found with id: " + id));

        if (!isSchoolUser(user)) {
            throw new IllegalArgumentException("User found, but is not a school user.");
        }

        user.setActive(true);
        Student savedUser = studentRepository.save(user);

        // Resolve schoolId if null
        Long schoolId = savedUser.getSchoolId();
        if (schoolId == null && savedUser.getSchoolName() != null && !savedUser.getSchoolName().isBlank() && schoolRepository != null) {
            schoolId = schoolRepository.findByName(savedUser.getSchoolName().trim())
                    .map(com.rslsolution.speakmateai.entity.School::getId)
                    .orElse(null);
        }

        String studentName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
        String schoolName = savedUser.getSchoolName() != null && !savedUser.getSchoolName().isBlank() ? savedUser.getSchoolName().trim() : "School";

        // Dispatch notifications
        if (notificationService != null) {
            try {
                // 1. Notify Super Admin
                notificationService.notifyAdmins(
                        "Student Activated",
                        "Student " + studentName + " (" + schoolName + ") has been activated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.STUDENT_UPDATED,
                        savedUser.getId(),
                        "STUDENT"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on activate: " + e.getMessage());
            }

            // 2. Notify respective School Admin
            if (schoolId != null) {
                try {
                    notificationService.notifySchoolAdmins(
                            schoolId,
                            "Student Activated",
                            "Student " + studentName + " has been activated by Super Admin.",
                            com.rslsolution.speakmateai.enums.NotificationType.STUDENT_UPDATED,
                            savedUser.getId(),
                            "STUDENT"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to dispatch school admin notification on activate: " + e.getMessage());
                }
            }
        }

        return mapToResponse(savedUser);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public AdminSchoolUserResponse deactivateStudent(Long id) {
        Student user = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School User not found with id: " + id));

        if (!isSchoolUser(user)) {
            throw new IllegalArgumentException("User found, but is not a school user.");
        }

        user.setActive(false);
        Student savedUser = studentRepository.save(user);

        // Resolve schoolId if null
        Long schoolId = savedUser.getSchoolId();
        if (schoolId == null && savedUser.getSchoolName() != null && !savedUser.getSchoolName().isBlank() && schoolRepository != null) {
            schoolId = schoolRepository.findByName(savedUser.getSchoolName().trim())
                    .map(com.rslsolution.speakmateai.entity.School::getId)
                    .orElse(null);
        }

        String studentName = (savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
        String schoolName = savedUser.getSchoolName() != null && !savedUser.getSchoolName().isBlank() ? savedUser.getSchoolName().trim() : "School";

        // Dispatch notifications
        if (notificationService != null) {
            try {
                // 1. Notify Super Admin
                notificationService.notifyAdmins(
                        "Student Deactivated",
                        "Student " + studentName + " (" + schoolName + ") has been deactivated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.STUDENT_UPDATED,
                        savedUser.getId(),
                        "STUDENT"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on deactivate: " + e.getMessage());
            }

            // 2. Notify respective School Admin
            if (schoolId != null) {
                try {
                    notificationService.notifySchoolAdmins(
                            schoolId,
                            "Student Deactivated",
                            "Student " + studentName + " has been deactivated by Super Admin.",
                            com.rslsolution.speakmateai.enums.NotificationType.STUDENT_UPDATED,
                            savedUser.getId(),
                            "STUDENT"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to dispatch school admin notification on deactivate: " + e.getMessage());
                }
            }
        }

        return mapToResponse(savedUser);
    }

    @Override
    public UserStatisticsResponse getSchoolUserStatistics() {
        Specification<Student> spec = SchoolUserSpecification.filterSchoolUsers(null, null, null, null, null, null, null);
        long totalUsers = studentRepository.count(spec);
        
        Specification<Student> activeSpec = SchoolUserSpecification.filterSchoolUsers(null, null, null, null, true, null, null);
        long activeUsers = studentRepository.count(activeSpec);
        
        Specification<Student> inactiveSpec = SchoolUserSpecification.filterSchoolUsers(null, null, null, null, false, null, null);
        long inactiveUsers = studentRepository.count(inactiveSpec);
        
        LocalDateTime thisMonthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Specification<Student> newThisMonthSpec = SchoolUserSpecification.filterSchoolUsers(null, null, null, null, null, thisMonthStart, null);
        long newUsersThisMonth = studentRepository.count(newThisMonthSpec);
        
        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .thisMonthRegistrations(newUsersThisMonth)
                .build();
    }

    @Override
    public String exportSchoolUsersCsv() {
        Specification<Student> spec = SchoolUserSpecification.filterSchoolUsers(null, null, null, null, null, null, null);
        java.util.List<Student> users = studentRepository.findAll(spec);
        users.sort(Comparator.comparing(Student::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        
        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("ID,First Name,Last Name,Email,Phone,School Name,Standard,Division,Roll Number,Parent Name,Parent Phone,Status,Registration Date\n");
        
        for (Student user : users) {
            csvBuilder.append(user.getId()).append(",")
                    .append(escapeSpecialCharacters(user.getFirstName())).append(",")
                    .append(escapeSpecialCharacters(user.getLastName())).append(",")
                    .append(escapeSpecialCharacters(user.getEmail())).append(",")
                    .append(escapeSpecialCharacters(user.getPhone())).append(",")
                    .append(escapeSpecialCharacters(user.getSchoolName())).append(",")
                    .append(escapeSpecialCharacters(user.getStandard())).append(",")
                    .append(escapeSpecialCharacters(user.getDivision())).append(",")
                    .append(escapeSpecialCharacters(user.getRollNumber())).append(",")
                    .append(escapeSpecialCharacters(user.getParentName())).append(",")
                    .append(escapeSpecialCharacters(user.getParentPhone())).append(",")
                    .append(user.isActive() ? "Active" : "Inactive").append(",")
                    .append(user.getCreatedAt())
                    .append("\n");
        }
        
        return csvBuilder.toString();
    }
    
    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "";
        }
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
