package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.rslsolution.speakmateai.dto.request.DeleteAccountRequest;
import com.rslsolution.speakmateai.dto.request.ForgotPasswordRequest;
import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.request.RegisterRequest;
import com.rslsolution.speakmateai.dto.request.SendDeleteAccountOtpRequest;
import com.rslsolution.speakmateai.dto.request.SendRegistrationOtpRequest;
import com.rslsolution.speakmateai.dto.request.VerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.DuplicateEmailException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.UserServiceImpl;
import com.rslsolution.speakmateai.util.JwtUtil;
import com.rslsolution.speakmateai.util.ValidationUtils;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class EmailNormalizationSecurityTest {

    private Validator validator;
    private UserRepository userRepository;
    private ProgressRepository progressRepository;
    private SettingsRepository settingsRepository;
    private OnboardingRepository onboardingRepository;
    private SchoolRepository schoolRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private UserServiceImpl userService;

    @BeforeEach
    public void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        userRepository = mock(UserRepository.class);
        progressRepository = mock(ProgressRepository.class);
        settingsRepository = mock(SettingsRepository.class);
        onboardingRepository = mock(OnboardingRepository.class);
        schoolRepository = mock(SchoolRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtil = mock(JwtUtil.class);

        userService = new UserServiceImpl();
        ReflectionTestUtils.setField(userService, "userRepository", userRepository);
        ReflectionTestUtils.setField(userService, "progressRepository", progressRepository);
        ReflectionTestUtils.setField(userService, "settingsRepository", settingsRepository);
        ReflectionTestUtils.setField(userService, "onboardingRepository", onboardingRepository);
        ReflectionTestUtils.setField(userService, "schoolRepository", schoolRepository);
        ReflectionTestUtils.setField(userService, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(userService, "jwtUtil", jwtUtil);
    }

    // =========================================================================
    // 1. ValidationUtils Matrix Tests (Section 15)
    // =========================================================================

    @Test
    @DisplayName("ValidationUtils.normalizeEmail handles null safely")
    public void testNormalizeEmailNull() {
        assertNull(ValidationUtils.normalizeEmail(null));
    }

    @ParameterizedTest
    @CsvSource(value = {
        "user@example.com, user@example.com",
        "USER@EXAMPLE.COM, user@example.com",
        "User@Example.Com, user@example.com",
        "' user@example.com ', user@example.com",
        "' user@example.com', user@example.com",
        "'user@example.com ', user@example.com",
        "'  user@example.com', user@example.com",
        "'user @example.com', 'user @example.com'",
        "' user @example.com ', 'user @example.com'",
        "' ', ''",
        "'', ''"
    })
    @DisplayName("ValidationUtils.normalizeEmail adheres to exact Section 15 matrix")
    public void testNormalizeEmailMatrix(String input, String expected) {
        assertEquals(expected, ValidationUtils.normalizeEmail(input));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "user@example.com",
        "USER@EXAMPLE.COM",
        "User@Example.Com",
        " user@example.com ",
        " user@example.com",
        "user@example.com ",
        "  user@example.com"
    })
    @DisplayName("ValidationUtils.isValidEmail returns true for valid emails regardless of case/whitespace")
    public void testIsValidEmailSuccess(String input) {
        assertTrue(ValidationUtils.isValidEmail(input));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "user @example.com",
        " user @example.com ",
        " ",
        "",
        "user@",
        "@example.com",
        "plainaddress"
    })
    @DisplayName("ValidationUtils.isValidEmail returns false for internal whitespace, empty, or invalid format")
    public void testIsValidEmailFailure(String input) {
        assertFalse(ValidationUtils.isValidEmail(input));
    }

    // =========================================================================
    // 2. DTO Normalization Tests
    // =========================================================================

    @Test
    @DisplayName("RegisterRequest normalizes email on setter and builder")
    public void testRegisterRequestNormalization() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail(" USER@EXAMPLE.COM ");
        assertEquals("user@example.com", req.getEmail());

        RegisterRequest fromBuilder = RegisterRequest.builder()
                .email("  Test.User@Domain.COM  ")
                .build();
        assertEquals("test.user@domain.com", fromBuilder.getEmail());
    }

    @Test
    @DisplayName("LoginRequest normalizes email and leaves password completely untouched")
    public void testLoginRequestNormalization() {
        String rawPassword = "  P@ssw0rd! with spaces  ";
        LoginRequest req = new LoginRequest(" USER@EXAMPLE.COM ", rawPassword);
        assertEquals("user@example.com", req.getEmail());
        assertEquals(rawPassword, req.getPassword(), "Password must not be modified or trimmed!");

        LoginRequest fromBuilder = LoginRequest.builder()
                .email("  User@Example.Com  ")
                .password(rawPassword)
                .build();
        assertEquals("user@example.com", fromBuilder.getEmail());
        assertEquals(rawPassword, fromBuilder.getPassword(), "Password must not be modified or trimmed!");
    }

    @Test
    @DisplayName("ForgotPasswordRequest normalizes email on setter")
    public void testForgotPasswordRequestNormalization() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail(" Forgot@Password.COM ");
        assertEquals("forgot@password.com", req.getEmail());
    }

    @Test
    @DisplayName("VerifyOtpRequest normalizes email on setter")
    public void testVerifyOtpRequestNormalization() {
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail(" Otp@Verify.COM ");
        assertEquals("otp@verify.com", req.getEmail());
    }

    @Test
    @DisplayName("SendRegistrationOtpRequest, SendDeleteAccountOtpRequest, DeleteAccountRequest normalize email")
    public void testOtherOtpRequestsNormalization() {
        SendRegistrationOtpRequest regOtp = new SendRegistrationOtpRequest();
        regOtp.setEmail(" SendReg@Email.COM ");
        assertEquals("sendreg@email.com", regOtp.getEmail());

        SendDeleteAccountOtpRequest delOtp = new SendDeleteAccountOtpRequest();
        delOtp.setEmail(" SendDel@Email.COM ");
        assertEquals("senddel@email.com", delOtp.getEmail());

        DeleteAccountRequest delReq = new DeleteAccountRequest();
        delReq.setEmail(" Delete@Email.COM ");
        assertEquals("delete@email.com", delReq.getEmail());
    }

    @Test
    @DisplayName("ProfileRequest normalizes email on setter")
    public void testProfileRequestNormalization() {
        ProfileRequest req = new ProfileRequest();
        req.setEmail(" Profile@Update.COM ");
        assertEquals("profile@update.com", req.getEmail());
    }

    // =========================================================================
    // 3. Entity Normalization Tests
    // =========================================================================

    @Test
    @DisplayName("User entity normalizes email on setter, builder, and lifecycle hooks")
    public void testUserEntityNormalization() {
        User user = new User();
        user.setEmail(" ENTITY@EXAMPLE.COM ");
        assertEquals("entity@example.com", user.getEmail());

        User fromBuilder = User.builder()
                .email(" BUILDER@EXAMPLE.COM ")
                .build();
        assertEquals("builder@example.com", fromBuilder.getEmail());

        user.setEmail(" LIFECYCLE@HOOKS.COM ");
        user.onCreate();
        assertEquals("lifecycle@hooks.com", user.getEmail());

        user.setEmail(" UPDATE@HOOKS.COM ");
        user.onUpdate();
        assertEquals("update@hooks.com", user.getEmail());
    }

    // =========================================================================
    // 4. Bean Validation Tests
    // =========================================================================

    @Test
    @DisplayName("Bean Validation: RegisterRequest accepts normalized email with surrounding whitespace")
    public void testRegisterRequestBeanValidationSuccess() {
        RegisterRequest req = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email(" user@example.com ")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Normalized email should pass bean validation");
    }

    @Test
    @DisplayName("Bean Validation: RegisterRequest rejects internal whitespace")
    public void testRegisterRequestBeanValidationInternalWhitespace() {
        RegisterRequest req = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("user @example.com")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Email with internal whitespace must fail @Email validation");
    }

    @Test
    @DisplayName("Bean Validation: RegisterRequest rejects whitespace-only email")
    public void testRegisterRequestBeanValidationWhitespaceOnly() {
        RegisterRequest req = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("   ")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Whitespace-only email must fail @NotBlank validation");
    }

    // =========================================================================
    // 5. Service-Level Security & Registration Duplicate Prevention
    // =========================================================================

    @Test
    @DisplayName("Registration: Duplicate check rejects registration when email exists in different casing/whitespace")
    public void testDuplicateEmailDetectionAcrossCasing() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

        RegisterRequest req = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email(" USER@EXAMPLE.COM ")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        DuplicateEmailException ex = assertThrows(DuplicateEmailException.class, () -> userService.register(req));
        assertEquals("Email already exists.", ex.getMessage());
    }

    @Test
    @DisplayName("Login: Resolves existing account with uppercase and leading/trailing whitespace")
    public void testLoginResolvesCaseInsensitively() {
        User existingUser = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("user@example.com")
                .password("encoded_pass")
                .role(Role.USER)
                .active(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("rawPass123", "encoded_pass")).thenReturn(true);
        when(jwtUtil.generateToken("user@example.com")).thenReturn("mocked.jwt.token");

        LoginRequest loginReq = new LoginRequest(" USER@EXAMPLE.COM ", "rawPass123");
        AuthResponse response = userService.login(loginReq);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("user@example.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Forgot Password: Resolves account consistently across case and whitespace variations")
    public void testForgotPasswordResolvesCaseInsensitively() {
        User existingUser = User.builder()
                .id(2L)
                .firstName("Bob")
                .lastName("Jones")
                .email("user@example.com")
                .active(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingUser));

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("  USER@EXAMPLE.COM  ");

        userService.forgotPassword(forgotReq);

        assertEquals("user@example.com", existingUser.getEmail());
        assertNotNull(existingUser.getResetOtp(), "Reset OTP should be generated for the resolved user");
    }
}
