package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.request.RegisterRequest;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.ProfileServiceImpl;
import com.rslsolution.speakmateai.service.impl.UserServiceImpl;
import com.rslsolution.speakmateai.util.ValidationUtils;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class NameValidationSecurityTest {

    private Validator validator;
    private UserRepository userRepository;
    private ProgressRepository progressRepository;
    private ProfileServiceImpl profileService;
    private UserServiceImpl userService;

    private static final String EXPECTED_ERROR = "Names can only contain letters and must be at least 2 characters.";

    @BeforeEach
    public void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        userRepository = mock(UserRepository.class);
        progressRepository = mock(ProgressRepository.class);

        profileService = new ProfileServiceImpl(userRepository, progressRepository);

        userService = new UserServiceImpl();
        ReflectionTestUtils.setField(userService, "userRepository", userRepository);
    }

    // ==========================================
    // 1. DIRECT VALIDATION UTILS MATRIX TESTS
    // ==========================================

    @ParameterizedTest(name = "Valid name: {0}")
    @ValueSource(strings = {
        "John",
        "Mary Jane",
        "O'Connor",
        "Anne-Marie",
        "Jean-Pierre",
        "Jean Pierre",
        "D'Angelo",
        "Al",
        "Jo",
        "Mary-Jane O'Connor"
    })
    @DisplayName("Should accept valid names containing letters, spaces, hyphens, and apostrophes")
    public void testValidNames(String name) {
        assertTrue(ValidationUtils.isValidName(name));
        ValidationUtils.validateName(name); // Should not throw
    }

    @ParameterizedTest(name = "Invalid name: {0}")
    @ValueSource(strings = {
        "A",
        "12345",
        "John123",
        "User###",
        "John@",
        "John_123",
        "\uD83D\uDE00John", // 😀John
        "John\uD83D\uDE00", // John😀
        "!!!",
        "",
        "   ",
        "                                         ", // 41 spaces
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" // 41 chars
    })
    @DisplayName("Should reject invalid names from the matrix with exact error message")
    public void testInvalidNames(String name) {
        assertFalse(ValidationUtils.isValidName(name));
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            ValidationUtils.validateName(name);
        });
        assertEquals(EXPECTED_ERROR, ex.getMessage());
    }

    @Test
    @DisplayName("Should reject null name with exact error message")
    public void testNullName() {
        assertFalse(ValidationUtils.isValidName(null));
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            ValidationUtils.validateName(null);
        });
        assertEquals(EXPECTED_ERROR, ex.getMessage());
    }

    // ==========================================
    // 2. COMBINATION TESTS
    // ==========================================

    @Test
    @DisplayName("Combination: Valid First + Valid Last -> PASS")
    public void testValidFirstAndValidLast() {
        assertTrue(ValidationUtils.isValidName("John") && ValidationUtils.isValidName("Doe"));
    }

    @Test
    @DisplayName("Combination: Valid First + Invalid Last -> FAIL")
    public void testValidFirstAndInvalidLast() {
        assertFalse(ValidationUtils.isValidName("John") && ValidationUtils.isValidName("Doe123"));
    }

    @Test
    @DisplayName("Combination: Invalid First + Valid Last -> FAIL")
    public void testInvalidFirstAndValidLast() {
        assertFalse(ValidationUtils.isValidName("John123") && ValidationUtils.isValidName("Doe"));
    }

    @Test
    @DisplayName("Combination: Invalid First + Invalid Last -> FAIL")
    public void testInvalidFirstAndInvalidLast() {
        assertFalse(ValidationUtils.isValidName("John123") && ValidationUtils.isValidName("Doe123"));
    }

    // ==========================================
    // 3. BEAN VALIDATION ON RegisterRequest
    // ==========================================

    @Test
    @DisplayName("RegisterRequest: Valid names pass validation")
    public void testRegisterRequestValid() {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Mary Jane")
                .lastName("O'Connor")
                .email("mary.jane@example.com")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Expected no validation violations for valid names");
    }

    @ParameterizedTest(name = "RegisterRequest invalid firstName: {0}")
    @ValueSource(strings = { "A", "12345", "John123", "User###", "John@", "\uD83D\uDE00John", "!!!", "", "   " })
    public void testRegisterRequestInvalidFirstName(String badFirstName) {
        RegisterRequest request = RegisterRequest.builder()
                .firstName(badFirstName)
                .lastName("Doe")
                .email("test@example.com")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Expected validation violations for invalid firstName: " + badFirstName);
        boolean hasExpectedMessage = violations.stream()
                .anyMatch(v -> "firstName".equals(v.getPropertyPath().toString()) && EXPECTED_ERROR.equals(v.getMessage()));
        assertTrue(hasExpectedMessage, "Expected violation message '" + EXPECTED_ERROR + "' on firstName");
    }

    @ParameterizedTest(name = "RegisterRequest invalid lastName: {0}")
    @ValueSource(strings = { "A", "12345", "John123", "User###", "John@", "\uD83D\uDE00John", "!!!", "", "   " })
    public void testRegisterRequestInvalidLastName(String badLastName) {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("John")
                .lastName(badLastName)
                .email("test@example.com")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build();

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Expected validation violations for invalid lastName: " + badLastName);
        boolean hasExpectedMessage = violations.stream()
                .anyMatch(v -> "lastName".equals(v.getPropertyPath().toString()) && EXPECTED_ERROR.equals(v.getMessage()));
        assertTrue(hasExpectedMessage, "Expected violation message '" + EXPECTED_ERROR + "' on lastName");
    }

    // ==========================================
    // 4. BEAN VALIDATION ON ProfileRequest
    // ==========================================

    @Test
    @DisplayName("ProfileRequest: Valid names pass validation")
    public void testProfileRequestValid() {
        ProfileRequest request = ProfileRequest.builder()
                .firstName("Anne-Marie")
                .lastName("Jean-Pierre")
                .email("valid@example.com")
                .build();

        Set<ConstraintViolation<ProfileRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Expected no validation violations for valid profile names");
    }

    @Test
    @DisplayName("ProfileRequest: Null names pass (allows updating other fields without name)")
    public void testProfileRequestNullNamesAllowed() {
        ProfileRequest request = ProfileRequest.builder()
                .firstName(null)
                .lastName(null)
                .englishLevel("Intermediate")
                .build();

        Set<ConstraintViolation<ProfileRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Expected null names to be allowed for partial profile updates");
    }

    @ParameterizedTest(name = "ProfileRequest invalid firstName: {0}")
    @ValueSource(strings = { "A", "12345", "John123", "User###", "John@", "\uD83D\uDE00John", "!!!" })
    public void testProfileRequestInvalidFirstName(String badFirstName) {
        ProfileRequest request = ProfileRequest.builder()
                .firstName(badFirstName)
                .lastName("ValidName")
                .build();

        Set<ConstraintViolation<ProfileRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Expected violation for bad firstName: " + badFirstName);
        boolean hasExpectedMessage = violations.stream()
                .anyMatch(v -> "firstName".equals(v.getPropertyPath().toString()) && EXPECTED_ERROR.equals(v.getMessage()));
        assertTrue(hasExpectedMessage, "Expected violation message on profile firstName");
    }

    // ==========================================
    // 5. AUTHORITATIVE BACKEND SERVICE TESTS
    // ==========================================

    @Test
    @DisplayName("UserServiceImpl.register: Rejects invalid firstName authoritatively")
    public void testUserServiceRegisterRejectsInvalidFirstName() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);

        RegisterRequest request = RegisterRequest.builder()
                .firstName("John123")
                .lastName("Doe")
                .email("new@example.com")
                .password("StrongPass123!")
                .confirmPassword("StrongPass123!")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            userService.register(request);
        });
        assertEquals(EXPECTED_ERROR, ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("UserServiceImpl.register: Rejects invalid lastName authoritatively")
    public void testUserServiceRegisterRejectsInvalidLastName() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);

        RegisterRequest request = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe###")
                .email("new@example.com")
                .password("StrongPass123!")
                .confirmPassword("StrongPass123!")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            userService.register(request);
        });
        assertEquals(EXPECTED_ERROR, ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("ProfileServiceImpl.updateProfile: Rejects invalid firstName and preserves existing profile")
    public void testProfileServiceUpdateRejectsInvalidFirstName() {
        String userEmail = "testuser@example.com";
        User existingUser = User.builder()
                .id(1L)
                .firstName("OriginalFirst")
                .lastName("OriginalLast")
                .email(userEmail)
                .role(com.rslsolution.speakmateai.enums.Role.USER)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(userEmail);
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(existingUser));

        ProfileRequest badRequest = ProfileRequest.builder()
                .firstName("Bad123")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateProfile(badRequest);
        });

        assertEquals(EXPECTED_ERROR, ex.getMessage());
        assertEquals("OriginalFirst", existingUser.getFirstName(), "Existing firstName must not be changed!");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("ProfileServiceImpl.updateProfile: Rejects invalid lastName and preserves existing profile")
    public void testProfileServiceUpdateRejectsInvalidLastName() {
        String userEmail = "testuser@example.com";
        User existingUser = User.builder()
                .id(1L)
                .firstName("OriginalFirst")
                .lastName("OriginalLast")
                .email(userEmail)
                .role(com.rslsolution.speakmateai.enums.Role.USER)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(userEmail);
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(existingUser));

        ProfileRequest badRequest = ProfileRequest.builder()
                .lastName("A") // length 1 -> invalid
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateProfile(badRequest);
        });

        assertEquals(EXPECTED_ERROR, ex.getMessage());
        assertEquals("OriginalLast", existingUser.getLastName(), "Existing lastName must not be changed!");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("ProfileServiceImpl.updateProfile: Accepts valid names and updates successfully")
    public void testProfileServiceUpdateAcceptsValidNames() {
        String userEmail = "testuser@example.com";
        User existingUser = User.builder()
                .id(1L)
                .firstName("OriginalFirst")
                .lastName("OriginalLast")
                .email(userEmail)
                .role(com.rslsolution.speakmateai.enums.Role.USER)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(userEmail);
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileRequest validRequest = ProfileRequest.builder()
                .firstName("  Mary Jane  ")
                .lastName("  O'Connor  ")
                .build();

        profileService.updateProfile(validRequest);

        assertEquals("Mary Jane", existingUser.getFirstName(), "firstName must be trimmed and updated");
        assertEquals("O'Connor", existingUser.getLastName(), "lastName must be trimmed and updated");
        verify(userRepository).save(existingUser);
    }
}
