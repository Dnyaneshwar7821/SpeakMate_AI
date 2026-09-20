package com.rslsolution.speakmateai.assistant.provider;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.StandardDivision;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

class SchoolRosterDataProviderTest {

	private SchoolRepository schoolRepository;
	private UserRepository userRepository;
	private StudentRepository studentRepository;
	private TeacherRepository teacherRepository;
	private TeacherStandardDivisionRepository teacherStandardDivisionRepository;
	private TeacherAssignmentResolver teacherAssignmentResolver;
	private ObjectMapper objectMapper;
	private SchoolRosterDataProvider provider;

	@BeforeEach
	void setUp() {
		schoolRepository = mock(SchoolRepository.class);
		userRepository = mock(UserRepository.class);
		studentRepository = mock(StudentRepository.class);
		teacherRepository = mock(TeacherRepository.class);
		teacherStandardDivisionRepository = mock(TeacherStandardDivisionRepository.class);
		teacherAssignmentResolver = mock(TeacherAssignmentResolver.class);
		objectMapper = new ObjectMapper();

		provider = new SchoolRosterDataProvider(
				schoolRepository,
				userRepository,
				studentRepository,
				teacherRepository,
				teacherStandardDivisionRepository,
				teacherAssignmentResolver,
				objectMapper
		);
	}

	@Test
	@DisplayName("7-B has 0 students: Super Admin asking for teacher returns Pratik Patil from teacher assignments")
	void testTeacherFor7BZeroStudents() throws Exception {
		// Mock Teacher: Pratik Patil (ID 88)
		User pratik = new User();
		pratik.setId(88L);
		pratik.setFirstName("Pratik");
		pratik.setLastName("Patil");
		pratik.setEmail("digvijaypatil0541@gmail.com");
		pratik.setRole(Role.TEACHER);

		when(userRepository.findByRole(Role.TEACHER)).thenReturn(List.of(pratik));
		// 0 students in the database for 7-B
		when(studentRepository.findAll()).thenReturn(List.of());

		// Mock TeacherStandardDivision link for 7-B
		SchoolStandard ss7 = new SchoolStandard();
		ss7.setStandard("7");
		StandardDivision sd7B = new StandardDivision();
		sd7B.setDivision("B");
		sd7B.setSchoolStandard(ss7);

		TeacherStandardDivision link = new TeacherStandardDivision();
		link.setTeacher(pratik);
		link.setStandardDivision(sd7B);

		when(teacherStandardDivisionRepository.findWithClassesByTeacherIdIn(any())).thenReturn(List.of(link));

		ActorContext superAdmin = ActorContext.builder().userId(1L).displayName("Super Admin").role(Role.SUPER_ADMIN).build();
		Map<String, Object> params = Map.of(
				"standard", "7",
				"division", "B",
				"classes", List.of("7-B"),
				"entityType", "TEACHERS"
		);

		String json = provider.provide(superAdmin, params);
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(1, data.get("teacherCount"));
		assertEquals(0, data.get("studentCount"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> teachers = (List<Map<String, Object>>) data.get("teachers");
		assertEquals(1, teachers.size());
		assertEquals("Pratik Patil", teachers.get(0).get("name"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> assignments = (List<Map<String, Object>>) data.get("classAssignments");
		assertNotNull(assignments);
		assertEquals(1, assignments.size());
		assertEquals("7-B", assignments.get(0).get("class"));
		assertEquals("Pratik Patil", assignments.get(0).get("teacher"));
		assertEquals(Boolean.TRUE, assignments.get(0).get("hasTeacher"));
		assertEquals(0, ((Number) assignments.get(0).get("studentCount")).intValue());

		String summary = String.valueOf(data.get("summary"));
		assertTrue(summary.contains("Pratik Patil"));
		assertTrue(summary.contains("7-B"));
	}

	@Test
	@DisplayName("Multi-class inquiry: 2-A has teacher Chetan Mali; 10-A has no teacher")
	void testMultiClassTeacherResolution() throws Exception {
		User chetan = new User();
		chetan.setId(149L);
		chetan.setFirstName("Chetan");
		chetan.setLastName("Mali");
		chetan.setRole(Role.TEACHER);

		when(userRepository.findByRole(Role.TEACHER)).thenReturn(List.of(chetan));
		when(studentRepository.findAll()).thenReturn(List.of());

		SchoolStandard ss2 = new SchoolStandard();
		ss2.setStandard("2");
		StandardDivision sd2A = new StandardDivision();
		sd2A.setDivision("A");
		sd2A.setSchoolStandard(ss2);

		TeacherStandardDivision link = new TeacherStandardDivision();
		link.setTeacher(chetan);
		link.setStandardDivision(sd2A);

		when(teacherStandardDivisionRepository.findWithClassesByTeacherIdIn(any())).thenReturn(List.of(link));

		ActorContext superAdmin = ActorContext.builder().userId(1L).displayName("Super Admin").role(Role.SUPER_ADMIN).build();
		Map<String, Object> params = Map.of(
				"classes", List.of("2-A", "10-A"),
				"entityType", "TEACHERS"
		);

		String json = provider.provide(superAdmin, params);
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> assignments = (List<Map<String, Object>>) data.get("classAssignments");
		assertNotNull(assignments);
		assertEquals(2, assignments.size());

		// 2-A
		assertEquals("2-A", assignments.get(0).get("class"));
		assertEquals("Chetan Mali", assignments.get(0).get("teacher"));
		assertEquals(Boolean.TRUE, assignments.get(0).get("hasTeacher"));

		// 10-A
		assertEquals("10-A", assignments.get(1).get("class"));
		assertFalse(Boolean.TRUE.equals(assignments.get(1).get("hasTeacher")));

		String summary = String.valueOf(data.get("summary"));
		assertTrue(summary.contains("2-A: Chetan Mali"));
		assertTrue(summary.contains("10-A: No teacher assigned"));
	}
}
