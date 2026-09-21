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
import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.ClassStudent;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

class ClassDataProviderTest {

	private ClassRoomRepository classRoomRepository;
	private ClassStudentRepository classStudentRepository;
	private StudentRepository studentRepository;
	private ProgressRepository progressRepository;
	private TeacherStandardDivisionRepository teacherStandardDivisionRepository;
	private UserRepository userRepository;
	private ObjectMapper objectMapper;
	private ClassDataProvider provider;

	private ActorContext schoolAdmin;

	@BeforeEach
	void setUp() {
		classRoomRepository = mock(ClassRoomRepository.class);
		classStudentRepository = mock(ClassStudentRepository.class);
		studentRepository = mock(StudentRepository.class);
		progressRepository = mock(ProgressRepository.class);
		teacherStandardDivisionRepository = mock(TeacherStandardDivisionRepository.class);
		userRepository = mock(UserRepository.class);
		objectMapper = new ObjectMapper();

		provider = new ClassDataProvider(
				classRoomRepository,
				classStudentRepository,
				studentRepository,
				progressRepository,
				teacherStandardDivisionRepository,
				userRepository,
				objectMapper
		);

		schoolAdmin = ActorContext.builder()
				.userId(145L)
				.displayName("Raj Malhotra")
				.email("admin@dypatil.edu")
				.role(Role.SCHOOL_ADMIN)
				.schoolId(24L)
				.build();
	}

	@Test
	@DisplayName("ClassDataProvider picks class using normalized standard ('9') and division ('A') matching DB 'Grade 9'")
	void testPickClassNormalizedGradeAndDivision() throws Exception {
		ClassRoom c4A = ClassRoom.builder().id(45L).schoolId(24L).name("Grade 4 - A").grade("4").division("A").status(Status.ACTIVE).teacherId(156L).build();
		ClassRoom c9A = ClassRoom.builder().id(11L).schoolId(24L).name("Grade 9 - A").grade("Grade 9").division("A").status(Status.ACTIVE).teacherId(88L).build();

		when(classRoomRepository.findBySchoolId(24L)).thenReturn(List.of(c4A, c9A));

		ClassStudent cs1 = ClassStudent.builder().id(1L).classId(11L).studentId(94L).build();
		when(classStudentRepository.findByClassId(11L)).thenReturn(List.of(cs1));

		Student s1 = new Student();
		s1.setId(94L);
		s1.setFirstName("Siddhi");
		s1.setLastName("Narke");
		when(studentRepository.findAllById(List.of(94L))).thenReturn(List.of(s1));

		Progress p1 = Progress.builder().id(76L).xp(409).currentStreak(1).totalPracticeMinutes(2).build();
		when(progressRepository.findByStudent(s1)).thenReturn(Optional.of(p1));

		User teacher = User.builder().id(88L).firstName("Pratik").lastName("Patil").build();
		when(userRepository.findById(88L)).thenReturn(Optional.of(teacher));

		String json = provider.provide(schoolAdmin, Map.of("standard", "9", "division", "A"));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
		assertEquals("Grade 9 - A", data.get("className"));
		assertEquals("Grade 9", data.get("grade"));
		assertEquals("A", data.get("division"));
		assertEquals(1, data.get("studentCount"));
		assertEquals("Pratik Patil", data.get("assignedTeacher"));
		assertEquals(409, data.get("totalXp"));
		assertEquals(1, data.get("studentsWithActiveStreak"));

		@SuppressWarnings("unchecked")
		Map<String, Object> top = (Map<String, Object>) data.get("topStudent");
		assertNotNull(top);
		assertEquals("Siddhi Narke", top.get("name"));
		assertEquals(409, top.get("xp"));

		String summary = (String) data.get("summary");
		assertNotNull(summary);
		assertTrue(summary.contains("Pratik Patil"));
		assertTrue(summary.contains("Grade 9 - A"));
	}

	@Test
	@DisplayName("ClassDataProvider picks class with ordinal string like '6th Standard' when given standard '6'")
	void testPickClassWithOrdinalStandard() throws Exception {
		ClassRoom c6A = ClassRoom.builder().id(38L).schoolId(24L).name("Grade 6th Standard - A").grade("6th Standard").division("A").status(Status.ACTIVE).build();
		when(classRoomRepository.findBySchoolId(24L)).thenReturn(List.of(c6A));
		when(classStudentRepository.findByClassId(38L)).thenReturn(List.of());

		String json = provider.provide(schoolAdmin, Map.of("standard", "6", "division", "A"));
		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
		assertEquals("Grade 6th Standard - A", data.get("className"));
		assertEquals("Not assigned", data.get("assignedTeacher"));
		assertEquals(0, data.get("studentCount"));
	}

	@Test
	@DisplayName("ClassDataProvider prefers class with teacher and falls back to school students by standard and division")
	void testFallbackToSchoolStudentsByStandardAndDivision() throws Exception {
		ClassRoom c9Empty = ClassRoom.builder().id(12L).schoolId(24L).name("Grade 9 - A").grade("9").division("A").status(Status.ACTIVE).teacherId(null).build();
		ClassRoom c9WithTeacher = ClassRoom.builder().id(11L).schoolId(24L).name("Grade 9 - A").grade("9").division("A").status(Status.ACTIVE).teacherId(88L).build();
		when(classRoomRepository.findBySchoolId(24L)).thenReturn(List.of(c9Empty, c9WithTeacher));

		// class_student is empty
		when(classStudentRepository.findByClassId(11L)).thenReturn(List.of());

		Student s1 = new Student();
		s1.setId(94L);
		s1.setFirstName("Siddhi");
		s1.setLastName("Narke");
		s1.setStandard("9");
		s1.setDivision("A");
		s1.setTeacherId(88L);

		Student s2 = new Student();
		s2.setId(99L);
		s2.setFirstName("Rohan");
		s2.setLastName("Kadam");
		s2.setStandard("9");
		s2.setDivision("A");
		s2.setTeacherId(88L);

		when(studentRepository.findBySchoolId(24L)).thenReturn(List.of(s1, s2));

		Progress p1 = Progress.builder().id(76L).xp(409).currentStreak(1).totalPracticeMinutes(2).build();
		when(progressRepository.findByStudent(s1)).thenReturn(Optional.of(p1));
		when(progressRepository.findByStudent(s2)).thenReturn(Optional.empty());

		User teacher = User.builder().id(88L).firstName("Pratik").lastName("Patil").build();
		when(userRepository.findById(88L)).thenReturn(Optional.of(teacher));

		String json = provider.provide(schoolAdmin, Map.of("standard", "9", "division", "A"));
		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});

		assertEquals("Grade 9 - A", data.get("className"));
		assertEquals("Pratik Patil", data.get("assignedTeacher"));
		assertEquals(2, data.get("studentCount"));
		assertEquals(409, data.get("totalXp"));
		assertEquals(204, data.get("averageXpPerStudent"));
	}

	@Test
	@DisplayName("Teacher with multiple classes only counts students matching each class's grade and division")
	void testTeacherPerClassStudentCountsIsolation() throws Exception {
		ActorContext teacherActor = ActorContext.builder()
				.userId(88L)
				.displayName("John Doe")
				.email("john@dypatil.edu")
				.role(Role.TEACHER)
				.schoolId(24L)
				.teacherId(88L)
				.build();

		ClassRoom c9A = ClassRoom.builder().id(11L).schoolId(24L).name("Grade 9 - A").grade("9").division("A").status(Status.ACTIVE).teacherId(88L).build();
		ClassRoom c6A = ClassRoom.builder().id(13L).schoolId(24L).name("Grade 6 - A").grade("6").division("A").status(Status.ACTIVE).teacherId(88L).build();
		ClassRoom c8D = ClassRoom.builder().id(37L).schoolId(24L).name("Grade 8 - D").grade("8").division("D").status(Status.ACTIVE).teacherId(88L).build();
		ClassRoom c7A = ClassRoom.builder().id(39L).schoolId(24L).name("Grade 7 - A").grade("7").division("A").status(Status.ACTIVE).teacherId(88L).build();

		when(classRoomRepository.findByTeacherId(88L)).thenReturn(List.of(c9A, c6A, c8D, c7A));
		when(classStudentRepository.findByClassId(11L)).thenReturn(List.of());
		when(classStudentRepository.findByClassId(13L)).thenReturn(List.of());
		when(classStudentRepository.findByClassId(37L)).thenReturn(List.of());
		when(classStudentRepository.findByClassId(39L)).thenReturn(List.of());

		Student s1 = new Student();
		s1.setId(94L);
		s1.setFirstName("Siddhi");
		s1.setLastName("Narke");
		s1.setStandard("9");
		s1.setDivision("A");
		s1.setTeacherId(88L);

		Student s2 = new Student();
		s2.setId(99L);
		s2.setFirstName("Onkar");
		s2.setLastName("Awate");
		s2.setStandard("9");
		s2.setDivision("A");
		s2.setTeacherId(88L);

		// Two 10th graders assigned to John Doe
		Student s3 = new Student();
		s3.setId(101L);
		s3.setFirstName("Kaustubh");
		s3.setLastName("Salunkhe");
		s3.setStandard("10");
		s3.setDivision("A");
		s3.setTeacherId(88L);

		when(studentRepository.findBySchoolId(24L)).thenReturn(List.of(s1, s2, s3));

		String json = provider.provide(teacherActor, Map.of("myClasses", true));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
		assertEquals(4, data.get("totalAssignedClasses"));
		assertEquals(2, data.get("totalStudentsAcrossClasses"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> classList = (List<Map<String, Object>>) data.get("assignedClassesList");
		assertNotNull(classList);
		assertEquals(4, classList.size());

		Map<String, Object> c9 = classList.stream().filter(c -> "Grade 9 - A".equals(c.get("name"))).findFirst().orElseThrow();
		assertEquals(2, ((Number) c9.get("studentCount")).intValue(), "Grade 9 - A must have 2 students (Siddhi & Onkar)");

		Map<String, Object> c6 = classList.stream().filter(c -> "Grade 6 - A".equals(c.get("name"))).findFirst().orElseThrow();
		assertEquals(0, ((Number) c6.get("studentCount")).intValue(), "Grade 6 - A must have 0 students");

		Map<String, Object> c8 = classList.stream().filter(c -> "Grade 8 - D".equals(c.get("name"))).findFirst().orElseThrow();
		assertEquals(0, ((Number) c8.get("studentCount")).intValue(), "Grade 8 - D must have 0 students");

		Map<String, Object> c7 = classList.stream().filter(c -> "Grade 7 - A".equals(c.get("name"))).findFirst().orElseThrow();
		assertEquals(0, ((Number) c7.get("studentCount")).intValue(), "Grade 7 - A must have 0 students");
	}
}
