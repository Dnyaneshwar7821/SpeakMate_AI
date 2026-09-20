package com.rslsolution.speakmateai.assistant.provider;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PlatformUsersDataProviderTest {

	@Mock
	private UserRepository userRepository;

	private ObjectMapper objectMapper;
	private PlatformUsersDataProvider provider;

	private User superAdmin;
	private User schoolAdmin;
	private User teacher1;
	private User teacher2;
	private User student1;
	private User student2;
	private User learner;

	private ActorContext actor;

	@BeforeEach
	void setUp() {
		objectMapper = new ObjectMapper();
		provider = new PlatformUsersDataProvider(userRepository, objectMapper);
		actor = ActorContext.builder().userId(1L).displayName("Super Admin").email("super@example.com").role(Role.SUPER_ADMIN).build();

		superAdmin = User.builder().firstName("System").lastName("Admin").email("super@example.com").role(Role.SUPER_ADMIN).active(true).build();
		schoolAdmin = User.builder().firstName("Principal").lastName("Sharma").email("admin@example.com").role(Role.SCHOOL_ADMIN).active(true).build();
		teacher1 = User.builder().firstName("Anita").lastName("Deshmukh").email("anita@example.com").role(Role.TEACHER).active(true).build();
		teacher2 = User.builder().firstName("Vikram").lastName("Joshi").email("vikram@example.com").role(Role.TEACHER).active(true).build();
		student1 = User.builder().firstName("Siddhi").lastName("Narke").email("siddhi@example.com").role(Role.STUDENT).active(true).build();
		student2 = User.builder().firstName("Ayush").lastName("Patil").email("ayush@example.com").role(Role.STUDENT).active(true).build();
		learner = User.builder().firstName("Gangu").lastName("Algule").email("gangu@example.com").role(Role.USER).active(true).build();

		when(userRepository.findAll()).thenReturn(List.of(superAdmin, schoolAdmin, teacher1, teacher2, student1, student2, learner));
	}

	@Test
	void testProvideAllUsersWithoutFilter() throws Exception {
		String json = provider.provide(actor, Map.of());
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(7, ((Number) data.get("totalUsers")).intValue());
		assertEquals(2, ((Number) data.get("totalTeachers")).intValue());
		assertEquals(2, ((Number) data.get("totalStudents")).intValue());
		assertEquals(1, ((Number) data.get("totalSchoolAdmins")).intValue());
		assertEquals(1, ((Number) data.get("totalSuperAdmins")).intValue());
		assertEquals(1, ((Number) data.get("totalLearners")).intValue());
		assertEquals(7, ((Number) data.get("userCount")).intValue());
		assertEquals("", data.get("roleFilter"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> users = (List<Map<String, Object>>) data.get("users");
		assertEquals(7, users.size());
	}

	@Test
	void testProvideFilterTeachers() throws Exception {
		String json = provider.provide(actor, Map.of("roleFilter", "TEACHER"));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(7, ((Number) data.get("totalUsers")).intValue());
		assertEquals(2, ((Number) data.get("userCount")).intValue());
		assertEquals("Teacher", data.get("roleFilter"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> users = (List<Map<String, Object>>) data.get("users");
		assertEquals(2, users.size());
		assertTrue(users.stream().allMatch(u -> "Teacher".equals(u.get("role"))));
	}

	@Test
	void testProvideFilterStudents() throws Exception {
		String json = provider.provide(actor, Map.of("roleFilter", "STUDENT"));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(2, ((Number) data.get("userCount")).intValue());
		assertEquals("Student", data.get("roleFilter"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> users = (List<Map<String, Object>>) data.get("users");
		assertEquals(2, users.size());
		assertTrue(users.stream().allMatch(u -> "Student".equals(u.get("role"))));
	}

	@Test
	void testProvideFilterSuperAdmins() throws Exception {
		String json = provider.provide(actor, Map.of("roleFilter", "SUPER_ADMIN"));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(1, ((Number) data.get("userCount")).intValue());
		assertEquals("Super Admin", data.get("roleFilter"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> users = (List<Map<String, Object>>) data.get("users");
		assertEquals(1, users.size());
		assertEquals("Super Admin", users.get(0).get("role"));
	}

	@Test
	void testProvideFilterSchoolAdmins() throws Exception {
		String json = provider.provide(actor, Map.of("roleFilter", "SCHOOL_ADMIN"));
		assertNotNull(json);

		Map<String, Object> data = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
		assertEquals(1, ((Number) data.get("userCount")).intValue());
		assertEquals("School Admin", data.get("roleFilter"));

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> users = (List<Map<String, Object>>) data.get("users");
		assertEquals(1, users.size());
		assertEquals("School Admin", users.get(0).get("role"));
	}

	@Test
	void testProvideRoleSynonymsAndPlurals() throws Exception {
		// Plural "SUPER_ADMINS"
		Map<String, Object> data1 = objectMapper.readValue(
				provider.provide(actor, Map.of("roleFilter", "SUPER_ADMINS")),
				new TypeReference<Map<String, Object>>() {});
		assertEquals(1, ((Number) data1.get("userCount")).intValue());
		assertEquals("Super Admin", data1.get("roleFilter"));

		// Plural "TEACHERS"
		Map<String, Object> data2 = objectMapper.readValue(
				provider.provide(actor, Map.of("role", "TEACHERS")),
				new TypeReference<Map<String, Object>>() {});
		assertEquals(2, ((Number) data2.get("userCount")).intValue());
		assertEquals("Teacher", data2.get("roleFilter"));

		// "ADMIN" -> SCHOOL_ADMIN
		Map<String, Object> data3 = objectMapper.readValue(
				provider.provide(actor, Map.of("roleFilter", "ADMIN")),
				new TypeReference<Map<String, Object>>() {});
		assertEquals(1, ((Number) data3.get("userCount")).intValue());
		assertEquals("School Admin", data3.get("roleFilter"));

		// "LEARNER" -> USER
		Map<String, Object> data4 = objectMapper.readValue(
				provider.provide(actor, Map.of("roleFilter", "LEARNER")),
				new TypeReference<Map<String, Object>>() {});
		assertEquals(1, ((Number) data4.get("userCount")).intValue());
		assertEquals("User", data4.get("roleFilter"));
	}
}
