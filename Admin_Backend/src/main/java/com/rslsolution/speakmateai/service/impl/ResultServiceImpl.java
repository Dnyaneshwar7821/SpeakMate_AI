package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.ResultRequest;
import com.rslsolution.speakmateai.dto.response.ResultResponse;
import com.rslsolution.speakmateai.entity.Result;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ResultRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.ResultService;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional
public class ResultServiceImpl implements ResultService {

	private final ResultRepository resultRepository;
	private final UserRepository userRepository;

	public ResultServiceImpl(ResultRepository resultRepository, UserRepository userRepository) {
		this.resultRepository = resultRepository;
		this.userRepository = userRepository;
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

	private String deriveStatus(Double marksObtained, Double totalMarks) {
		if (totalMarks == null || totalMarks == 0) {
			return "Fail";
		}
		double percentage = (marksObtained / totalMarks) * 100;
		if (percentage >= 90) {
			return "Excellent";
		} else if (percentage >= 75) {
			return "Good";
		} else if (percentage >= 50) {
			return "Pass";
		} else {
			return "Fail";
		}
	}

	private ResultResponse mapToResponse(Result result) {
		String studentName = (result.getStudent().getFirstName() != null ? result.getStudent().getFirstName() : "")
				+ (result.getStudent().getLastName() != null ? " " + result.getStudent().getLastName() : "");
		String standard = result.getStudent().getStandard();
		Double percentage = result.getTotalMarks() != null && result.getTotalMarks() > 0
				? (result.getMarksObtained() / result.getTotalMarks()) * 100
				: 0.0;

		return ResultResponse.builder().id(result.getId()).studentId(result.getStudent().getId()).studentName(studentName.trim())
				.standard(standard).testTitle(result.getTestTitle()).marksObtained(result.getMarksObtained())
				.totalMarks(result.getTotalMarks()).percentage(Math.round(percentage * 100.0) / 100.0)
				.status(result.getStatus() != null ? result.getStatus() : deriveStatus(result.getMarksObtained(), result.getTotalMarks()))
				.submittedAt(result.getSubmittedAt()).createdAt(result.getCreatedAt()).build();
	}

	@Override
	public ResultResponse createResult(ResultRequest request) {
		User currentUser = getCurrentUser();

		User student = userRepository.findById(request.getStudentId())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		if (student.getRole() != Role.STUDENT) {
			throw new RuntimeException("User is not a student");
		}

		if (!isSuperAdmin(currentUser) && !isSchoolAdmin(currentUser)) {
			throw new RuntimeException("Unauthorized: Only Super Admin or School Admin can create results");
		}

		if (isSchoolAdmin(currentUser) && !student.getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Student does not belong to your school");
		}

		String status = deriveStatus(request.getMarksObtained(), request.getTotalMarks());

		Result result = Result.builder().student(student).testTitle(request.getTestTitle())
				.marksObtained(request.getMarksObtained()).totalMarks(request.getTotalMarks()).status(status)
				.active(request.getActive() != null ? request.getActive() : true).build();

		Result saved = resultRepository.save(result);
		return mapToResponse(saved);
	}

	@Override
	public ResultResponse getResultById(Long id) {
		User currentUser = getCurrentUser();
		Result result = resultRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Result not found"));

		if (!isSuperAdmin(currentUser) && !isSchoolAdmin(currentUser)) {
			throw new RuntimeException("Unauthorized");
		}

		if (isSchoolAdmin(currentUser) && !result.getStudent().getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Result does not belong to your school");
		}

		return mapToResponse(result);
	}

	@Override
	public List<ResultResponse> getAllResults() {
		User currentUser = getCurrentUser();
		List<Result> results;

		if (isSuperAdmin(currentUser)) {
			results = resultRepository.findAll();
		} else if (isSchoolAdmin(currentUser)) {
			results = resultRepository.findAll((Specification<Result>) (root, query, cb) -> {
				List<Predicate> predicates = new ArrayList<>();
				predicates.add(cb.equal(root.get("student").get("schoolId"), currentUser.getSchoolId()));
				predicates.add(cb.isTrue(root.get("active")));
				return cb.and(predicates.toArray(new Predicate[0]));
			});
		} else {
			throw new RuntimeException("Unauthorized");
		}

		return results.stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public List<ResultResponse> getResultsByStudent(Long studentId) {
		User currentUser = getCurrentUser();
		User student = userRepository.findById(studentId)
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		if (!isSuperAdmin(currentUser) && !isSchoolAdmin(currentUser)) {
			throw new RuntimeException("Unauthorized");
		}

		if (isSchoolAdmin(currentUser) && !student.getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Student does not belong to your school");
		}

		List<Result> results = resultRepository.findByStudentAndActiveTrue(student);
		return results.stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public ResultResponse updateResult(Long id, ResultRequest request) {
		User currentUser = getCurrentUser();
		Result result = resultRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Result not found"));

		if (!isSuperAdmin(currentUser) && !isSchoolAdmin(currentUser)) {
			throw new RuntimeException("Unauthorized");
		}

		if (isSchoolAdmin(currentUser) && !result.getStudent().getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Result does not belong to your school");
		}

		User student = userRepository.findById(request.getStudentId())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		if (student.getRole() != Role.STUDENT) {
			throw new RuntimeException("User is not a student");
		}

		if (isSchoolAdmin(currentUser) && !student.getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Student does not belong to your school");
		}

		String status = deriveStatus(request.getMarksObtained(), request.getTotalMarks());

		result.setStudent(student);
		result.setTestTitle(request.getTestTitle());
		result.setMarksObtained(request.getMarksObtained());
		result.setTotalMarks(request.getTotalMarks());
		result.setStatus(status);
		if (request.getActive() != null) {
			result.setActive(request.getActive());
		}

		Result updated = resultRepository.save(result);
		return mapToResponse(updated);
	}

	@Override
	public void deleteResult(Long id) {
		User currentUser = getCurrentUser();
		Result result = resultRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Result not found"));

		if (!isSuperAdmin(currentUser) && !isSchoolAdmin(currentUser)) {
			throw new RuntimeException("Unauthorized");
		}

		if (isSchoolAdmin(currentUser) && !result.getStudent().getSchoolId().equals(currentUser.getSchoolId())) {
			throw new RuntimeException("Unauthorized: Result does not belong to your school");
		}

		result.setActive(false);
		resultRepository.save(result);
	}

	@Override
	public List<ResultResponse> searchResults(String searchTerm) {
		User currentUser = getCurrentUser();
		String lowerSearch = searchTerm.toLowerCase();

		Specification<Result> spec = (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (isSchoolAdmin(currentUser)) {
				predicates.add(cb.equal(root.get("student").get("schoolId"), currentUser.getSchoolId()));
			}

			predicates.add(cb.isTrue(root.get("active")));

			predicates.add(cb.or(
					cb.like(cb.lower(root.get("testTitle")), "%" + lowerSearch + "%"),
					cb.like(cb.lower(root.get("student").get("firstName")), "%" + lowerSearch + "%"),
					cb.like(cb.lower(root.get("student").get("lastName")), "%" + lowerSearch + "%"),
					cb.like(cb.lower(root.get("student").get("rollNumber")), "%" + lowerSearch + "%")
			));

			return cb.and(predicates.toArray(new Predicate[0]));
		};

		List<Result> results = resultRepository.findAll(spec);
		return results.stream().map(this::mapToResponse).collect(Collectors.toList());
	}
}
