package com.rslsolution.speakmateai.service.impl;

import com.rslsolution.speakmateai.dto.request.StudentRequest;
import com.rslsolution.speakmateai.dto.response.StudentImportResponse;
import com.rslsolution.speakmateai.dto.response.StudentResponse;
import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.enums.UserType;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.rslsolution.speakmateai.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.EntityCascadeDeletionService entityCascadeDeletionService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.repository.TeacherRepository teacherRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 1. Try to find the user in the Tenant table
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            return user;
        }

        // 2. If not found, check the Platform Admins table
        Admin admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null && admin.getRole() == Role.SUPER_ADMIN) {
            // Create a proxy User object to satisfy the module's role checks
            User proxyAdmin = new User();
            proxyAdmin.setEmail(admin.getEmail());
            proxyAdmin.setRole(admin.getRole());
            return proxyAdmin;
        }

        throw new RuntimeException("Current user not found");
    }

    @Override
    public List<StudentResponse> getAllStudents() {
        User currentUser = getCurrentUser();
        List<Student> students;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            students = studentRepository.findAll();
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            students = studentRepository.findBySchoolId(currentUser.getSchoolId());
        } else {
            throw new RuntimeException("Unauthorized to access students");
        }

        return students.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public StudentResponse getStudentById(Long id) {
        User currentUser = getCurrentUser();
        Student student;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            student = studentRepository.findByIdAndSchoolId(id, currentUser.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Student not found or not in your school"));
        } else {
            throw new RuntimeException("Unauthorized to access students");
        }

        return mapToResponse(student);
    }

    @Override
    public StudentResponse createStudent(StudentRequest request) {
        User currentUser = getCurrentUser();
        
        Long schoolIdToUse;
        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            if (request.getSchoolId() == null) {
                throw new RuntimeException("Super Admin must provide a schoolId to assign the student to.");
            }
            schoolIdToUse = request.getSchoolId();
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            schoolIdToUse = currentUser.getSchoolId(); // Force school ID of current user
        } else {
            throw new RuntimeException("Unauthorized to create students");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.rslsolution.speakmateai.exception.DuplicateEmailException("An account with email '" + request.getEmail() + "' already exists. Please use a different email address.");
        }

        // Auto-generate Student ID (e.g. STU-2026-1234)
        java.util.Random random = new java.util.Random();
        String generatedStudentId = String.format("STU-2026-%04d", random.nextInt(10000));

        Student student = new Student();
        student.setFirstName(request.getFirstName() != null ? request.getFirstName().trim() : "");
        student.setLastName(request.getLastName() != null ? request.getLastName().trim() : "");
        student.setEmail(request.getEmail() != null ? request.getEmail().trim() : "");
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "defaultPassword123!";
        student.setPassword(passwordEncoder.encode(rawPassword));
        student.setRole(Role.STUDENT);
        student.setUserType(UserType.SCHOOL);
        student.setSchoolId(schoolIdToUse);
        student.setStudentId(generatedStudentId);

        boolean isActive = request.getActive() != null ? request.getActive() : (request.getStatus() != null ? request.getStatus() == Status.ACTIVE : true);
        student.setActive(isActive);
        student.setStatus(request.getStatus() != null ? request.getStatus() : (isActive ? Status.ACTIVE : Status.INACTIVE));

        if (request.getStandard() != null) {
            String std = request.getStandard().trim();
            student.setStandard(std);
            student.setSchoolGrade(UserServiceImpl.formatStandardToGrade(std));
        }
        if (request.getDivision() != null) student.setDivision(request.getDivision().trim().toUpperCase());
        if (request.getRollNumber() != null) student.setRollNumber(request.getRollNumber().trim());
        if (request.getParentName() != null) student.setParentName(request.getParentName().trim());
        if (request.getParentPhone() != null) student.setParentPhone(request.getParentPhone().trim());
        if (request.getPhone() != null) student.setPhone(request.getPhone().trim());
        if (request.getTeacherId() != null) student.setTeacherId(request.getTeacherId());

        Student savedStudent = studentRepository.save(student);

        if (notificationService != null) {
            try {
                String studentName = (savedStudent.getFirstName() + " " + (savedStudent.getLastName() != null ? savedStudent.getLastName() : "")).trim();
                notificationService.notifyAdmins("New Student Enrolled", "Student " + studentName + " (" + savedStudent.getStudentId() + ") has been enrolled.", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_CREATED, savedStudent.getId(), "STUDENT");
                notificationService.sendNotification(savedStudent.getEmail(), "Welcome to SpeakMate AI", "Your student account has been created. Start your learning journey today!", com.rslsolution.speakmateai.enums.NotificationType.STUDENT_CREATED, savedStudent.getId(), "STUDENT");
            } catch (Exception ignored) {}
        }

        return mapToResponse(savedStudent);
    }

    @Override
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        User currentUser = getCurrentUser();
        Student student;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Allow Super Admin to change schoolId if provided in request
            if (request.getSchoolId() != null) {
                student.setSchoolId(request.getSchoolId());
            }

        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            student = studentRepository.findByIdAndSchoolId(id, currentUser.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Student not found or not in your school"));
            
            // Ignore schoolId in request, keeping the student in the current school

        } else {
            throw new RuntimeException("Unauthorized to update students");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !student.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
            if (userRepository.existsByEmail(request.getEmail().trim())) {
                throw new RuntimeException("Email already exists");
            }
            student.setEmail(request.getEmail().trim());
        }

        if (request.getFirstName() != null) student.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) student.setLastName(request.getLastName().trim());
        student.setRole(Role.STUDENT);
        student.setUserType(UserType.SCHOOL);

        if (request.getActive() != null) {
            student.setActive(request.getActive());
            student.setStatus(request.getActive() ? Status.ACTIVE : Status.INACTIVE);
        } else if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
            student.setActive(request.getStatus() == Status.ACTIVE);
        }

        if (request.getStandard() != null) {
            String std = request.getStandard().trim();
            student.setStandard(std);
            student.setSchoolGrade(UserServiceImpl.formatStandardToGrade(std));
        }
        if (request.getDivision() != null) student.setDivision(request.getDivision().trim().toUpperCase());
        if (request.getRollNumber() != null) student.setRollNumber(request.getRollNumber().trim());
        if (request.getParentName() != null) student.setParentName(request.getParentName().trim());
        if (request.getParentPhone() != null) student.setParentPhone(request.getParentPhone().trim());
        if (request.getPhone() != null) student.setPhone(request.getPhone().trim());
        if (request.getTeacherId() != null) student.setTeacherId(request.getTeacherId());

        Student updatedStudent = studentRepository.save(student);
        return mapToResponse(updatedStudent);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteStudent(Long id) {
        User currentUser = getCurrentUser();
        Student student;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            student = studentRepository.findByIdAndSchoolId(id, currentUser.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Student not found or not in your school"));
        } else {
            throw new RuntimeException("Unauthorized to delete students");
        }

        if (entityCascadeDeletionService != null) {
            entityCascadeDeletionService.deleteStudentCascade(id);
        } else {
            studentRepository.delete(student);
            userRepository.deleteById(id);
        }
    }

    @Override
    public StudentImportResponse importStudents(MultipartFile file) {
        User currentUser = getCurrentUser();
        Long schoolIdToUse;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            throw new RuntimeException("Super Admin cannot perform bulk import without school context. Not fully implemented yet.");
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            schoolIdToUse = currentUser.getSchoolId();
        } else {
            throw new RuntimeException("Unauthorized to import students");
        }

        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int failedCount = 0;
        int totalCount = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                totalCount++;
                String[] data = line.split(",");
                if (data.length < 3) {
                    errors.add("Row " + totalCount + ": Invalid data format");
                    failedCount++;
                    continue;
                }
                
                String firstName = data[0].trim();
                String lastName = data[1].trim();
                String email = data[2].trim();

                try {
                    StudentRequest req = StudentRequest.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .schoolId(schoolIdToUse)
                            .build();
                    createStudent(req);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + totalCount + ": " + e.getMessage());
                    failedCount++;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }

        return StudentImportResponse.builder()
                .totalRecords(totalCount)
                .successfulImports(successCount)
                .failedImports(failedCount)
                .errors(errors)
                .build();
    }

    @Override
    public byte[] exportStudents(String format) {
        List<StudentResponse> students = getAllStudents();
        
        if ("csv".equalsIgnoreCase(format)) {
            students.sort(Comparator.comparing(StudentResponse::getId, Comparator.nullsLast(Comparator.naturalOrder())));
            StringBuilder csvBuilder = new StringBuilder();
            csvBuilder.append("ID,FirstName,LastName,Email,StudentId,SchoolId,Status,CreatedAt\n");
            for (StudentResponse student : students) {
                csvBuilder.append(student.getId()).append(",")
                        .append(student.getFirstName()).append(",")
                        .append(student.getLastName()).append(",")
                        .append(student.getEmail()).append(",")
                        .append(student.getStudentId()).append(",")
                        .append(student.getSchoolId()).append(",")
                        .append(student.getStatus()).append(",")
                        .append(student.getCreatedAt()).append("\n");
            }
            return csvBuilder.toString().getBytes();
        } else if ("excel".equalsIgnoreCase(format)) {
            // Placeholder for Excel export
            throw new RuntimeException("Excel export is supported conceptually but requires Apache POI implementation.");
        } else {
            throw new RuntimeException("Unsupported export format: " + format);
        }
    }

    @Override
    public void resetPassword(Long id, String newPassword) {
        User currentUser = getCurrentUser();
        Student student;

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
        } else if (currentUser.getRole() == Role.SCHOOL_ADMIN || currentUser.getRole() == Role.TEACHER) {
            student = studentRepository.findByIdAndSchoolId(id, currentUser.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Student not found or not in your school"));
        } else {
            throw new RuntimeException("Unauthorized to reset student passwords");
        }

        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);
    }

    private StudentResponse mapToResponse(Student user) {
        Status resolvedStatus = user.getStatus();
        if (resolvedStatus == null) {
            resolvedStatus = user.isActive() ? Status.ACTIVE : Status.INACTIVE;
        }

        String teacherName = null;
        if (user.getTeacherId() != null && teacherRepository != null) {
            teacherName = teacherRepository.findById(user.getTeacherId())
                    .map(t -> (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim())
                    .orElse(null);
        }

        return StudentResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .studentId(user.getStudentId())
                .schoolId(user.getSchoolId())
                .schoolName(user.getSchoolName())
                .standard(user.getStandard())
                .division(user.getDivision())
                .rollNumber(user.getRollNumber())
                .parentName(user.getParentName())
                .parentPhone(user.getParentPhone())
                .phone(user.getPhone())
                .teacherId(user.getTeacherId())
                .teacherName(teacherName)
                .active(user.isActive())
                .status(resolvedStatus)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
