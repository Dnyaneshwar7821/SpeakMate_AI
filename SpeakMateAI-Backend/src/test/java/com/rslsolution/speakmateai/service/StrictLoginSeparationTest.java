package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.InvalidCredentialsException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.service.impl.UserServiceImpl;
import com.rslsolution.speakmateai.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
public class StrictLoginSeparationTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private SchoolRepository schoolRepository;

	@Mock
	private ProgressRepository progressRepository;

	@Mock
	private SettingsRepository settingsRepository;

	@Mock
	private OnboardingRepository onboardingRepository;

	@Mock
	private UserSubscriptionRepository userSubscriptionRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtUtil jwtUtil;

	@InjectMocks
	private UserServiceImpl userService;

	private User personalUser;
	private User studentUser;
	private School schoolA;
	private School schoolB;

	@BeforeEach
	void setUp() {
		personalUser = User.builder()
				.id(1L)
				.firstName("Personal")
				.lastName("Learner")
				.email("personal@example.com")
				.password("encoded_Personal123!")
				.role(Role.USER)
				.active(true)
				.schoolId(null)
				.schoolName(null)
				.createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now())
				.build();

		studentUser = User.builder()
				.id(2L)
				.firstName("Student")
				.lastName("Learner")
				.email("student@example.com")
				.password("encoded_Student123!")
				.role(Role.STUDENT)
				.active(true)
				.schoolId(10L)
				.schoolName("School A")
				.schoolGrade("10th Std")
				.createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now())
				.build();

		schoolA = School.builder()
				.id(10L)
				.schoolCode("ABC123")
				.name("School A")
				.status("ACTIVE")
				.build();

		schoolB = School.builder()
				.id(20L)
				.schoolCode("XYZ999")
				.name("School B")
				.status("ACTIVE")
				.build();
	}

	// -------------------------------------------------------------
	// Personal User Matrix Tests (1 - 5)
	// -------------------------------------------------------------

	@Test
	@DisplayName("1. Personal + Standard Login + correct email/password -> SUCCESS")
	void test1_personalUser_standardLogin_success() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));
		when(passwordEncoder.matches("Personal123!", personalUser.getPassword())).thenReturn(true);
		when(jwtUtil.generateToken("personal@example.com")).thenReturn("mock-token-personal");
		when(onboardingRepository.findByUser(personalUser)).thenReturn(Optional.empty());

		LoginRequest request = new LoginRequest("personal@example.com", "Personal123!");
		AuthResponse response = userService.login(request);

		assertNotNull(response);
		assertEquals("mock-token-personal", response.getToken());
		assertEquals("INDIVIDUAL", response.getUser().getAccountType());
		assertEquals(false, response.getUser().getIsSchoolStudent());
	}

	@Test
	@DisplayName("2. Personal + Student Login + correct email/password + correct existing school code -> MUST FAIL")
	void test2_personalUser_studentLogin_correctSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		LoginRequest request = LoginRequest.builder()
				.email("personal@example.com")
				.password("Personal123!")
				.schoolCode("ABC123")
				.loginType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	@Test
	@DisplayName("3. Personal + Student Login + correct email/password + random school code -> MUST FAIL")
	void test3_personalUser_studentLogin_randomSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		LoginRequest request = LoginRequest.builder()
				.email("personal@example.com")
				.password("Personal123!")
				.schoolCode("RANDOM123")
				.loginType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	@Test
	@DisplayName("4. Personal + Student Login + correct email/password + another school's valid code -> MUST FAIL")
	void test4_personalUser_studentLogin_anotherSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		LoginRequest request = LoginRequest.builder()
				.email("personal@example.com")
				.password("Personal123!")
				.schoolCode("XYZ999")
				.portalType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	@Test
	@DisplayName("5. Personal + Student Login + wrong password + valid school code -> MUST FAIL")
	void test5_personalUser_studentLogin_wrongPassword_validSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		LoginRequest request = LoginRequest.builder()
				.email("personal@example.com")
				.password("WrongPass123!")
				.schoolCode("ABC123")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	// -------------------------------------------------------------
	// Student User Matrix Tests (6 - 10)
	// -------------------------------------------------------------

	@Test
	@DisplayName("6. Student + Student Login + correct email + password + student's actual school code -> SUCCESS")
	void test6_studentUser_studentLogin_correctSchoolCode_success() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);
		when(schoolRepository.findBySchoolCodeIgnoreCase("ABC123")).thenReturn(Optional.of(schoolA));
		when(jwtUtil.generateToken("student@example.com")).thenReturn("mock-token-student");
		when(onboardingRepository.findByUser(studentUser)).thenReturn(Optional.empty());

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("ABC123")
				.loginType("STUDENT")
				.build();

		AuthResponse response = userService.login(request);

		assertNotNull(response);
		assertEquals("mock-token-student", response.getToken());
		assertEquals("STUDENT", response.getUser().getAccountType());
		assertEquals(true, response.getUser().getIsSchoolStudent());
	}

	@Test
	@DisplayName("7. Student + Student Login + correct email + password + wrong school's valid code -> MUST FAIL")
	void test7_studentUser_studentLogin_wrongSchoolValidCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);
		when(schoolRepository.findBySchoolCodeIgnoreCase("XYZ999")).thenReturn(Optional.of(schoolB));

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("XYZ999")
				.loginType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid student login details or school code.", ex.getMessage());
	}

	@Test
	@DisplayName("8. Student + Student Login + correct email + password + random school code -> MUST FAIL")
	void test8_studentUser_studentLogin_randomSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);
		when(schoolRepository.findBySchoolCodeIgnoreCase("RANDOM123")).thenReturn(Optional.empty());

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("RANDOM123")
				.loginType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid student login details or school code.", ex.getMessage());
	}

	@Test
	@DisplayName("9. Student + Student Login + correct email + wrong password + correct school code -> MUST FAIL")
	void test9_studentUser_studentLogin_wrongPassword_correctSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("WrongPass123!", studentUser.getPassword())).thenReturn(false);

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("WrongPass123!")
				.schoolCode("ABC123")
				.loginType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Incorrect password", ex.getMessage());
	}

	@Test
	@DisplayName("10. Student + Student Login + correct email + password + empty school code -> MUST FAIL")
	void test10_studentUser_studentLogin_emptySchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("")
				.portalType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid student login details or school code.", ex.getMessage());
	}

	// -------------------------------------------------------------
	// Security / Bypass Tests (11 - 16)
	// -------------------------------------------------------------

	@Test
	@DisplayName("11. Personal user manually sends Student login request with portalType=STUDENT and valid school code -> MUST FAIL")
	void test11_personalUser_manuallySendsPortalTypeStudent_fails() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		LoginRequest request = LoginRequest.builder()
				.email("personal@example.com")
				.password("Personal123!")
				.portalType("STUDENT")
				.schoolCode("ABC123")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	@Test
	@DisplayName("12. Personal user manually modifies client-side account type to STUDENT -> Backend authority enforced")
	void test12_personalUser_clientTampering_backendAuthorityEnforced() {
		when(userRepository.findByEmailIgnoreCase("personal@example.com")).thenReturn(Optional.of(personalUser));

		// Attacker tampers request to have loginType=STUDENT and portalType=STUDENT
		LoginRequest tamperedRequest = LoginRequest.builder()
				.email("personal@example.com")
				.password("Personal123!")
				.loginType("STUDENT")
				.portalType("STUDENT")
				.schoolCode("ABC123")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(tamperedRequest));
		assertEquals("This account is registered as an Individual Learner. Please use the Standard Login tab.", ex.getMessage());
	}

	@Test
	@DisplayName("13. Student sends another school's valid school code -> MUST FAIL")
	void test13_studentUser_sendsAnotherSchoolValidCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);
		when(schoolRepository.findBySchoolCodeIgnoreCase("XYZ999")).thenReturn(Optional.of(schoolB));

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("XYZ999")
				.portalType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid student login details or school code.", ex.getMessage());
	}

	@Test
	@DisplayName("14. Nonexistent email + valid school code -> MUST FAIL")
	void test14_nonexistentEmail_validSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("ghost@example.com")).thenReturn(Optional.empty());
		when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

		LoginRequest request = LoginRequest.builder()
				.email("ghost@example.com")
				.password("AnyPassword123!")
				.schoolCode("ABC123")
				.portalType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid email", ex.getMessage());
	}

	@Test
	@DisplayName("15. Valid student email + valid password + nonexistent school code -> MUST FAIL")
	void test15_validStudent_nonexistentSchoolCode_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));
		when(passwordEncoder.matches("Student123!", studentUser.getPassword())).thenReturn(true);
		when(schoolRepository.findBySchoolCodeIgnoreCase("NONEXISTENT")).thenReturn(Optional.empty());

		LoginRequest request = LoginRequest.builder()
				.email("student@example.com")
				.password("Student123!")
				.schoolCode("NONEXISTENT")
				.portalType("STUDENT")
				.build();

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("Invalid student login details or school code.", ex.getMessage());
	}

	@Test
	@DisplayName("16. Student + Standard Login (without school code) -> MUST FAIL")
	void test16_studentUser_standardLogin_fails() {
		when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(studentUser));

		LoginRequest request = new LoginRequest("student@example.com", "Student123!");

		InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> userService.login(request));
		assertEquals("This account is registered as a School Student. Please use the Student Login tab with your School Code.", ex.getMessage());
	}
}
