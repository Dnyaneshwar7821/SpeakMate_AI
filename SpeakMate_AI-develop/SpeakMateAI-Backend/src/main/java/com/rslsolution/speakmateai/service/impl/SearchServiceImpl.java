package com.rslsolution.speakmateai.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.SearchResponse;
import com.rslsolution.speakmateai.dto.response.SearchResultItem;
import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.ClassStudent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.SearchService;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional
public class SearchServiceImpl implements SearchService {

	private final UserRepository userRepository;
	private final SchoolRepository schoolRepository;
	private final ClassRoomRepository classRoomRepository;
	private final ClassStudentRepository classStudentRepository;

	public SearchServiceImpl(UserRepository userRepository, SchoolRepository schoolRepository,
			ClassRoomRepository classRoomRepository, ClassStudentRepository classStudentRepository) {
		this.userRepository = userRepository;
		this.schoolRepository = schoolRepository;
		this.classRoomRepository = classRoomRepository;
		this.classStudentRepository = classStudentRepository;
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
	}

	private boolean isSuperAdmin(User user) {
		return user.getRole() == Role.SUPER_ADMIN;
	}

	private boolean isSchoolAdmin(User user) {
		return user.getRole() == Role.SCHOOL_ADMIN;
	}

	private boolean isTeacher(User user) {
		return user.getRole() == Role.TEACHER;
	}

	@Override
	public SearchResponse globalSearch(String query) {
		User currentUser = getCurrentUser();
		String lowerQuery = query.toLowerCase();
		List<SearchResultItem> results = new ArrayList<>();

		if (isSuperAdmin(currentUser)) {
			searchUsers(lowerQuery, null, results, "user");
			searchTeachers(lowerQuery, null, results);
			searchSchools(lowerQuery, results);
		} else if (isSchoolAdmin(currentUser)) {
			searchUsers(lowerQuery, currentUser.getSchoolId(), results, "student");
			searchTeachers(lowerQuery, currentUser.getSchoolId(), results);
		} else if (isTeacher(currentUser)) {
			searchStudentsForTeacher(currentUser, lowerQuery, results);
		}

		return SearchResponse.of(results);
	}

	private void searchUsers(String lowerQuery, Long schoolId, List<SearchResultItem> results, String type) {
		Specification<User> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isTrue(root.get("active")));
			predicates.add(cb.notEqual(root.get("role"), Role.SUPER_ADMIN));
			predicates.add(cb.notEqual(root.get("role"), Role.ADMIN));

			if (schoolId != null) {
				predicates.add(cb.equal(root.get("schoolId"), schoolId));
			}

			predicates.add(cb.or(
					cb.like(cb.lower(root.get("firstName")), "%" + lowerQuery + "%"),
					cb.like(cb.lower(root.get("lastName")), "%" + lowerQuery + "%"),
					cb.like(cb.lower(root.get("email")), "%" + lowerQuery + "%")
			));

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		List<User> users = userRepository.findAll(spec);
		for (User user : users) {
			String firstName = user.getFirstName() != null ? user.getFirstName() : "";
			String lastName = user.getLastName() != null ? user.getLastName() : "";
			String name = (firstName + " " + lastName).trim();
			results.add(SearchResultItem.builder().type(type).id(user.getId()).name(name).email(user.getEmail())
					.subtitle(user.getRole().name()).status(user.isActive() ? "Active" : "Inactive").build());
		}
	}

	private void searchTeachers(String lowerQuery, Long schoolId, List<SearchResultItem> results) {
		Specification<User> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isTrue(root.get("active")));
			predicates.add(cb.equal(root.get("role"), Role.TEACHER));

			if (schoolId != null) {
				predicates.add(cb.equal(root.get("schoolId"), schoolId));
			}

			predicates.add(cb.or(
					cb.like(cb.lower(root.get("firstName")), "%" + lowerQuery + "%"),
					cb.like(cb.lower(root.get("lastName")), "%" + lowerQuery + "%"),
					cb.like(cb.lower(root.get("email")), "%" + lowerQuery + "%")
			));

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		List<User> teachers = userRepository.findAll(spec);
		for (User teacher : teachers) {
			String firstName = teacher.getFirstName() != null ? teacher.getFirstName() : "";
			String lastName = teacher.getLastName() != null ? teacher.getLastName() : "";
			String name = (firstName + " " + lastName).trim();
			results.add(SearchResultItem.builder().type("teacher").id(teacher.getId()).name(name).email(teacher.getEmail())
					.subtitle("Teacher").status(teacher.isActive() ? "Active" : "Inactive").build());
		}
	}

	private void searchSchools(String lowerQuery, List<SearchResultItem> results) {
		List<School> schools = schoolRepository.findAll((root, query, cb) -> {
			return cb.like(cb.lower(root.get("name")), "%" + lowerQuery + "%");
		});

		for (School school : schools) {
			results.add(SearchResultItem.builder().type("school").id(school.getId()).name(school.getName())
					.email(null).subtitle("School").status(school.isActive() ? "Active" : "Inactive").build());
		}
	}

	private void searchStudentsForTeacher(User teacher, String lowerQuery, List<SearchResultItem> results) {
		List<ClassRoom> classes = classRoomRepository.findByTeacherId(teacher.getId());
		if (classes == null || classes.isEmpty()) {
			return;
		}

		List<Long> classIds = classes.stream().map(ClassRoom::getId).collect(Collectors.toList());
		List<ClassStudent> classStudents = classStudentRepository.findByClassIdIn(classIds);

		List<Long> studentIds = classStudents.stream().map(ClassStudent::getStudentId).distinct()
				.collect(Collectors.toList());

		if (studentIds.isEmpty()) {
			return;
		}

		List<User> students = userRepository.findAllById(studentIds).stream()
				.filter(u -> u.getRole() == Role.STUDENT)
				.filter(u -> {
					String firstName = u.getFirstName() != null ? u.getFirstName() : "";
					String lastName = u.getLastName() != null ? u.getLastName() : "";
					String email = u.getEmail() != null ? u.getEmail() : "";
					return firstName.toLowerCase().contains(lowerQuery)
							|| lastName.toLowerCase().contains(lowerQuery)
							|| email.toLowerCase().contains(lowerQuery);
				})
				.collect(Collectors.toList());

		for (User student : students) {
			String firstName = student.getFirstName() != null ? student.getFirstName() : "";
			String lastName = student.getLastName() != null ? student.getLastName() : "";
			String name = (firstName + " " + lastName).trim();
			results.add(SearchResultItem.builder().type("student").id(student.getId()).name(name).email(student.getEmail())
					.subtitle("Student").status(student.isActive() ? "Active" : "Inactive").build());
		}
	}
}
