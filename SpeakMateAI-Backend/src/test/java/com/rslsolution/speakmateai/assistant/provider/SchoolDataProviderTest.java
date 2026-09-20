package com.rslsolution.speakmateai.assistant.provider;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

class SchoolDataProviderTest {

	private SchoolRepository schoolRepository;
	private UserRepository userRepository;
	private ClassRoomRepository classRoomRepository;
	private SchoolStandardRepository schoolStandardRepository;
	private StandardDivisionRepository standardDivisionRepository;
	private StudentRepository studentRepository;
	private ProgressRepository progressRepository;
	private ObjectMapper objectMapper;
	private SchoolDataProvider provider;

	private ActorContext schoolAdmin;
	private School dyPatil;
	private School jspm;

	@BeforeEach
	void setUp() {
		schoolRepository = mock(SchoolRepository.class);
		userRepository = mock(UserRepository.class);
		classRoomRepository = mock(ClassRoomRepository.class);
		schoolStandardRepository = mock(SchoolStandardRepository.class);
		standardDivisionRepository = mock(StandardDivisionRepository.class);
		studentRepository = mock(StudentRepository.class);
		progressRepository = mock(ProgressRepository.class);
		objectMapper = new ObjectMapper();

		provider = new SchoolDataProvider(
				schoolRepository,
				userRepository,
				classRoomRepository,
				schoolStandardRepository,
				standardDivisionRepository,
				studentRepository,
				progressRepository,
				objectMapper
		);

		dyPatil = School.builder().id(24L).name("DY Patil University").schoolName("DY Patil University").schoolCode("DYP01").active(true).build();
		jspm = School.builder().id(27L).name("JSPM").schoolName("JSPM").schoolCode("JSPM01").active(true).build();

		schoolAdmin = ActorContext.builder()
				.userId(145L)
				.displayName("Raj Malhotra")
				.email("admin@dypatil.edu")
				.role(Role.SCHOOL_ADMIN)
				.schoolId(24L)
				.build();
	}

	@Test
	@DisplayName("School Admin gets own school overview with top students and best student")
	void testSchoolAdminOverviewWithLeaderboard() throws Exception {
		when(schoolRepository.findById(24L)).thenReturn(Optional.of(dyPatil));
		when(userRepository.countByRoleAndSchoolId(Role.STUDENT, 24L)).thenReturn(4L);
		when(userRepository.countByRoleAndSchoolId(Role.TEACHER, 24L)).thenReturn(3L);
		when(userRepository.countByRoleAndSchoolId(Role.SCHOOL_ADMIN, 24L)).thenReturn(1L);
		when(userRepository.countByRoleAndSchoolIdAndActiveTrue(Role.STUDENT, 24L)).thenReturn(4L);
		when(userRepository.countByRoleAndSchoolIdAndActiveTrue(Role.TEACHER, 24L)).thenReturn(3L);
		when(classRoomRepository.countBySchoolId(24L)).thenReturn(10L);
		when(schoolStandardRepository.countBySchoolId(24L)).thenReturn(5L);
		when(standardDivisionRepository.countBySchoolId(24L)).thenReturn(8L);

		Student s1 = new Student();
		s1.setId(94L);
		s1.setFirstName("Siddhi");
		s1.setLastName("Narke");
		s1.setStandard("9");
		s1.setDivision("A");

		Student s2 = new Student();
		s2.setId(157L);
		s2.setFirstName("Vijay");
		s2.setLastName("Patil");
		s2.setStandard("4");
		s2.setDivision("A");

		when(studentRepository.findBySchoolId(24L)).thenReturn(List.of(s1, s2));

		Progress p1 = Progress.builder().id(76L).xp(409).currentStreak(1).level(1).totalPracticeMinutes(2).build();
		Progress p2 = Progress.builder().id(77L).xp(50).currentStreak(0).level(1).totalPracticeMinutes(1).build();

		when(progressRepository.findByStudent(s1)).thenReturn(Optional.of(p1));
		when(progressRepository.findByStudent(s2)).thenReturn(Optional.of(p2));

		String json = provider.provide(schoolAdmin, Map.of());
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
		assertEquals("DY Patil University", data.get("schoolName"));
		assertEquals(4, data.get("totalStudents"));
		assertEquals(3, data.get("totalTeachers"));

		// Check best student & top students
		Map<String, Object> bestStudent = (Map<String, Object>) data.get("bestStudent");
		assertNotNull(bestStudent);
		assertEquals("Siddhi Narke", bestStudent.get("name"));
		assertEquals(409, bestStudent.get("xp"));

		List<Map<String, Object>> topStudents = (List<Map<String, Object>>) data.get("topStudents");
		assertEquals(2, topStudents.size());
		assertEquals("Siddhi Narke", topStudents.get(0).get("name"));
		assertEquals("Vijay Patil", topStudents.get(1).get("name"));
	}

	@Test
	@DisplayName("School Admin attempting to query a foreign school is denied and does not leak available schools")
	void testSchoolAdminForeignSchoolAccessDenied() throws Exception {
		when(schoolRepository.findById(24L)).thenReturn(Optional.of(dyPatil));

		String json = provider.provide(schoolAdmin, Map.of("schoolName", "JSPM"));
		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});

		assertEquals("NO DATA", data.get("message"));
		String reason = (String) data.get("reason");
		assertNotNull(reason);
		assertTrue(reason.contains("Access denied"));

		// Must not leak other school names
		List<String> available = (List<String>) data.get("availableSchools");
		assertNotNull(available);
		assertEquals(List.of("DY Patil University"), available);
	}
}
