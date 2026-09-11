package com.rslsolution.speakmateai.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.StandardDivisionResponse;
import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.StandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import com.rslsolution.speakmateai.exception.ResourceNotFoundException;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.SchoolStandardService;
import com.rslsolution.speakmateai.util.StandardDivisionUtil;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SchoolStandardServiceImpl implements SchoolStandardService {

	private final UserRepository userRepository;
	private final SchoolRepository schoolRepository;
	private final ClassRoomRepository classRoomRepository;
	private final SchoolStandardRepository schoolStandardRepository;
	private final StandardDivisionRepository standardDivisionRepository;
	private final TeacherStandardDivisionRepository teacherStandardDivisionRepository;

	@Override
	@Transactional
	public List<StandardDivisionResponse> getStandards(Long schoolId) {
		User currentUser = getCurrentUser();
		Role role = currentUser.getRole();

		// TEACHER is only ever allowed to see their own school's standards.
		if (role == Role.TEACHER) {
			Long ownSchoolId = currentUser.getSchoolId();
			if (ownSchoolId == null || (schoolId != null && !ownSchoolId.equals(schoolId))) {
				throw new AccessDeniedException("Teachers may only access their own school's standard configuration");
			}
			return buildResponse(ownSchoolId, resolveAssignedStandards(currentUser));
		}

		// SCHOOL_ADMIN is restricted to their own school.
		if (role == Role.SCHOOL_ADMIN) {
			Long ownSchoolId = currentUser.getSchoolId();
			if (ownSchoolId == null || (schoolId != null && !ownSchoolId.equals(schoolId))) {
				throw new AccessDeniedException("School Admins may only access their own school's standard configuration");
			}
			return buildResponse(ownSchoolId, null);
		}

		// SUPER_ADMIN / ADMIN may access any school; a schoolId must be provided
		// (resolved to the caller's school when absent).
		if (role == Role.SUPER_ADMIN || role == Role.ADMIN) {
			Long resolvedSchoolId = schoolId != null ? schoolId : currentUser.getSchoolId();
			if (resolvedSchoolId == null) {
				throw new ResourceNotFoundException("No school is associated with this account");
			}
			return buildResponse(resolvedSchoolId, null);
		}

		throw new AccessDeniedException("Your role is not permitted to view school standard configuration");
	}

	@Override
	@Transactional
	public List<StandardDivisionResponse> getMySchoolStandards() {
		return getStandards(null);
	}

	@Override
	@Transactional
	public List<StandardDivisionResponse> configureStandards(Long schoolId, List<StandardDivisionResponse> request) {
		User currentUser = getCurrentUser();
		Role role = currentUser.getRole();

		Long resolvedSchoolId = schoolId != null ? schoolId : currentUser.getSchoolId();

		if (role == Role.SCHOOL_ADMIN) {
			if (currentUser.getSchoolId() == null || !currentUser.getSchoolId().equals(resolvedSchoolId)) {
				throw new AccessDeniedException("School Admins may only configure their own school's standard configuration");
			}
		} else if (role != Role.SUPER_ADMIN && role != Role.ADMIN) {
			throw new AccessDeniedException("Your role is not permitted to configure school standards");
		}

		School school = schoolRepository.findById(resolvedSchoolId)
				.orElseThrow(() -> new ResourceNotFoundException("School not found with id: " + resolvedSchoolId));

		// Get current configuration
		List<SchoolStandard> existingStandards = schoolStandardRepository.findBySchoolId(resolvedSchoolId);
		
		List<String> incomingStandardNames = new ArrayList<>();
		if (request != null) {
			for (StandardDivisionResponse sdr : request) {
				if (sdr.getStandard() != null && !sdr.getStandard().isBlank()) {
					incomingStandardNames.add(sdr.getStandard().trim());
				}
			}
		}

		// Check for removed standards to prevent invalidating teachers
		for (SchoolStandard es : existingStandards) {
			if (!incomingStandardNames.contains(es.getStandard())) {
				boolean hasTeachers = teacherStandardDivisionRepository.existsByStandardDivision_SchoolStandard_Id(es.getId());
				if (hasTeachers) {
					throw new IllegalArgumentException("Cannot delete standard " + es.getStandard() + " as it is currently assigned to teachers.");
				}
				schoolStandardRepository.delete(es);
			}
		}

		// Save new/updated standards
		if (request != null) {
			for (StandardDivisionResponse reqStd : request) {
				if (reqStd.getStandard() == null || reqStd.getStandard().isBlank()) continue;
				String stdName = reqStd.getStandard().trim();

				SchoolStandard schoolStandard = schoolStandardRepository.findBySchoolIdAndStandard(resolvedSchoolId, stdName)
						.orElseGet(() -> schoolStandardRepository.save(SchoolStandard.builder()
								.school(school)
								.standard(stdName)
								.build()));

				List<StandardDivision> existingDivs = standardDivisionRepository.findBySchoolStandardId(schoolStandard.getId());
				List<String> incomingDivNames = reqStd.getDivisions() != null ? 
					reqStd.getDivisions().stream().map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList()) : 
					new ArrayList<>();

				// Check removed divisions
				for (StandardDivision ed : existingDivs) {
					if (!incomingDivNames.contains(ed.getDivision())) {
						boolean hasTeachers = teacherStandardDivisionRepository.existsByStandardDivisionId(ed.getId());
						if (hasTeachers) {
							throw new IllegalArgumentException("Cannot delete division " + ed.getDivision() + " of standard " + stdName + " as it is currently assigned to teachers.");
						}
						standardDivisionRepository.delete(ed);
					}
				}

				// Add new divisions
				for (String divName : incomingDivNames) {
					if (!standardDivisionRepository.existsBySchoolStandardIdAndDivision(schoolStandard.getId(), divName)) {
						standardDivisionRepository.save(StandardDivision.builder()
								.schoolStandard(schoolStandard)
								.division(divName)
								.build());
					}
				}
			}
		}

		return buildResponse(resolvedSchoolId, null);
	}

	private List<StandardDivisionResponse> buildResponse(Long schoolId, Set<String> allowedStandards) {
		List<SchoolStandard> standards = schoolStandardRepository.findBySchoolId(schoolId);
		if ((standards == null || standards.isEmpty()) && schoolId != null) {
			List<StandardDivisionResponse> fallback = new ArrayList<>();
			for (int i = 1; i <= 10; i++) {
				String stdName = String.valueOf(i);
				if (allowedStandards == null || allowedStandards.contains(stdName)) {
					fallback.add(StandardDivisionResponse.builder()
							.standard(stdName)
							.divisions(List.of("A", "B"))
							.build());
				}
			}
			return fallback;
		}

		if (standards == null) {
			standards = new ArrayList<>();
		}

		// Sort standards numerically (e.g. 1st, 2nd, ..., 10th)
		standards.sort((a, b) -> {
			int numA = parseNumericStandard(a.getStandard());
			int numB = parseNumericStandard(b.getStandard());
			if (numA != numB) {
				return Integer.compare(numA, numB);
			}
			return a.getStandard().compareToIgnoreCase(b.getStandard());
		});

		List<StandardDivisionResponse> result = new ArrayList<>();

		for (SchoolStandard standard : standards) {
			if (allowedStandards != null && !allowedStandards.contains(standard.getStandard())) {
				continue;
			}
			
			List<StandardDivision> divisions = standardDivisionRepository.findBySchoolStandardId(standard.getId());
			List<String> divNames = divisions.stream()
					.map(StandardDivision::getDivision)
					.map(String::trim)
					.filter(d -> !d.isEmpty())
					.sorted()
					.collect(Collectors.toList());
			if (divNames.isEmpty()) {
				divNames = List.of("A", "B");
			}
			
			result.add(StandardDivisionResponse.builder()
					.standard(standard.getStandard())
					.divisions(divNames)
					.build());
		}
		
		return result;
	}

	private int parseNumericStandard(String std) {
		if (std == null) return 999;
		String numOnly = std.replaceAll("[^0-9]", "");
		if (numOnly.isEmpty()) return 999;
		try {
			return Integer.parseInt(numOnly);
		} catch (Exception e) {
			return 999;
		}
	}

	/**
	 * Resolves the standards assigned to a teacher from their ClassRoom
	 * assignments (canonical multi-standard source) plus the legacy single
	 * standard field.
	 */
	private Set<String> resolveAssignedStandards(User teacher) {
		Set<String> standards = new LinkedHashSet<>();
		if (teacher.getId() != null) {
			List<ClassRoom> classes = classRoomRepository.findByTeacherId(teacher.getId());
			if (classes != null) {
				for (ClassRoom c : classes) {
					if (c == null) continue;
					String grade = c.getGrade() != null && !c.getGrade().isBlank() ? c.getGrade() : c.getName();
					String normalized = normalizeStandard(grade);
					String matched = matchStandard(normalized);
					if (matched != null) {
						standards.add(matched);
					}
				}
			}
		}
		if (teacher.getStandard() != null && !teacher.getStandard().isBlank()) {
			String matched = matchStandard(normalizeStandard(teacher.getStandard()));
			if (matched != null) {
				standards.add(matched);
			}
		}
		return standards;
	}

	/**
	 * Normalizes "3rd Standard", "Grade 3", "CLASS 3", "3rd" -> "3".
	 */
	private String normalizeStandard(String value) {
		if (value == null) return "";
		return value.trim()
				.replaceAll("(?i)th|st|nd|rd|standard|grade|class", "")
				.trim();
	}

	/**
	 * Returns the canonical standard (e.g. "3rd") matching the normalized value,
	 * or null when the value does not correspond to one of the 1st-10th standards.
	 */
	private String matchStandard(String normalized) {
		if (normalized == null || !normalized.matches("\\d+")) return null;
		int value = Integer.parseInt(normalized);
		if (value < 1 || value > 10) return null;
		return StandardDivisionUtil.STANDARDS.get(value - 1);
	}

	private User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
	}
}
