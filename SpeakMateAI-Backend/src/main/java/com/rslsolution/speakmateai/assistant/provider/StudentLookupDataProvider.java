package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.GrammarHistory;
import com.rslsolution.speakmateai.entity.LessonProgress;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.Vocabulary;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;

/**
 * Individual student performance. Super Admin / School Admin can look up any
 * student in scope; Teachers are restricted to their own assigned students;
 * Students can never query other students through this provider (the registry
 * routes STUDENT callers to {@link SelfProgressDataProvider} instead).
 */
@Component
public class StudentLookupDataProvider implements AssistantDataProvider {

	private final StudentRepository studentRepository;
	private final UserRepository userRepository;
	private final ProgressRepository progressRepository;
	private final LessonProgressRepository lessonProgressRepository;
	private final SpeakingSessionRepository speakingSessionRepository;
	private final VocabularyRepository vocabularyRepository;
	private final GrammarHistoryRepository grammarHistoryRepository;
	private final TeacherAssignmentResolver teacherAssignmentResolver;
	private final ObjectMapper objectMapper;

	public StudentLookupDataProvider(StudentRepository studentRepository, UserRepository userRepository,
			ProgressRepository progressRepository,
			LessonProgressRepository lessonProgressRepository,
			SpeakingSessionRepository speakingSessionRepository,
			VocabularyRepository vocabularyRepository,
			GrammarHistoryRepository grammarHistoryRepository,
			TeacherAssignmentResolver teacherAssignmentResolver,
			ObjectMapper objectMapper) {
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
		this.progressRepository = progressRepository;
		this.lessonProgressRepository = lessonProgressRepository;
		this.speakingSessionRepository = speakingSessionRepository;
		this.vocabularyRepository = vocabularyRepository;
		this.grammarHistoryRepository = grammarHistoryRepository;
		this.teacherAssignmentResolver = teacherAssignmentResolver;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.STUDENT_PERFORMANCE;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Optional<Student> target = resolveStudent(actor, params);
		if (target.isEmpty()) {
			// The named person may exist in the users table but not in the students
			// table (a platform USER, a School Admin or a Teacher). XP is stored only on
			// a Student's Progress row, so a non-student legitimately has no learning
			// record - but that is a real, explainable answer ("this person is a USER,
			// not a student, so there is no XP"), never a shrug of "information not
			// available". Resolve the person and report their actual role.
			Optional<User> person = resolveUser(actor, params);
			if (person.isPresent()) {
				return toJson(nonStudentView(person.get()));
			}
			Map<String, Object> empty = new LinkedHashMap<>();
			empty.put("message", "NO DATA");
			empty.put("reason", "Student not found in the caller's scope.");
			return toJson(empty);
		}

		Student s = target.get();
		Progress p = progressRepository.findByStudent(s).orElse(null);

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("scope", "STUDENT (id=" + s.getId() + ")");
		data.put("studentName", fullName(s));
		data.put("studentId", s.getStudentId());
		data.put("standard", s.getStandard());
		data.put("division", s.getDivision());
		if (s.getRollNumber() != null && !s.getRollNumber().isBlank()) {
			data.put("rollNumber", s.getRollNumber());
		}
		if (s.getSchoolName() != null && !s.getSchoolName().isBlank()) {
			data.put("schoolName", s.getSchoolName());
		}

		// 1. Lesson-completion metrics
		List<LessonProgress> lessonRows = lessonProgressRepository.findByStudent(s);
		long lessonsCompleted = lessonProgressRepository.countByUserIdAndCompletedTrue(s.getId());
		long lessonsStarted = lessonRows.size();
		long lessonsPending = Math.max(0L, lessonsStarted - lessonsCompleted);
		data.put("lessonsCompleted", lessonsCompleted);
		data.put("lessonsStarted", lessonsStarted);
		data.put("lessonsPending", lessonsPending);

		// 2. Speaking sessions & evaluation scores
		List<SpeakingSession> sessions = speakingSessionRepository.findByUser(s);
		int totalSpeakingSessions = sessions.size();
		int completedSpeakingSessions = (int) sessions.stream()
				.filter(ss -> Boolean.TRUE.equals(ss.getCompleted()))
				.count();

		double totalFluency = 0;
		double totalPronunciation = 0;
		double totalGrammar = 0;
		double totalVocab = 0;
		double totalOverall = 0;
		int scoredCount = 0;

		for (SpeakingSession ss : sessions) {
			if (ss.getOverallScore() != null || ss.getScore() != null) {
				scoredCount++;
				if (ss.getFluencyScore() != null) totalFluency += ss.getFluencyScore();
				if (ss.getPronunciationScore() != null) totalPronunciation += ss.getPronunciationScore();
				if (ss.getGrammarScore() != null) totalGrammar += ss.getGrammarScore();
				if (ss.getVocabularyScore() != null) totalVocab += ss.getVocabularyScore();
				double overall = ss.getOverallScore() != null ? ss.getOverallScore() : (ss.getScore() != null ? ss.getScore() : 0.0);
				totalOverall += overall;
			}
		}

		double avgFluency = scoredCount > 0 ? Math.round((totalFluency / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgPronunciation = scoredCount > 0 ? Math.round((totalPronunciation / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgGrammar = scoredCount > 0 ? Math.round((totalGrammar / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgVocab = scoredCount > 0 ? Math.round((totalVocab / scoredCount) * 10.0) / 10.0 : 0.0;
		double avgOverall = scoredCount > 0 ? Math.round((totalOverall / scoredCount) * 10.0) / 10.0 : 0.0;

		data.put("totalSpeakingSessions", totalSpeakingSessions);
		data.put("completedSpeakingSessions", completedSpeakingSessions);
		if (scoredCount > 0) {
			data.put("overallSpeakingScore", avgOverall);
			data.put("fluencyScore", avgFluency);
			data.put("pronunciationScore", avgPronunciation);
			data.put("speakingGrammarScore", avgGrammar);
			data.put("speakingVocabularyScore", avgVocab);
		}

		// 3. Vocabulary words added & mastered
		List<Vocabulary> vocabs = vocabularyRepository.findByUserOrderByCreatedAtDesc(s);
		int totalVocabularyWords = vocabs.size();
		int masteredVocabularyWords = (int) vocabs.stream().filter(v -> Boolean.TRUE.equals(v.getMastered())).count();
		List<String> recentVocabWords = vocabs.stream()
				.limit(10)
				.map(Vocabulary::getWord)
				.filter(w -> w != null && !w.isBlank())
				.collect(Collectors.toList());
		data.put("totalVocabularyWords", totalVocabularyWords);
		data.put("masteredVocabularyWords", masteredVocabularyWords);
		if (!recentVocabWords.isEmpty()) {
			data.put("recentVocabularyWords", recentVocabWords);
		}

		// 4. Grammar checks
		List<GrammarHistory> grammarChecks = grammarHistoryRepository.findByUserIdOrderByCreatedAtDesc(s.getId());
		int totalGrammarChecks = grammarChecks.size();
		double totalGrammarScore = 0;
		int scoredGrammarCount = 0;
		for (GrammarHistory g : grammarChecks) {
			if (g.getGrammarScore() != null && g.getGrammarScore() > 0) {
				totalGrammarScore += g.getGrammarScore();
				scoredGrammarCount++;
			}
		}
		double avgGrammarScore = scoredGrammarCount > 0 ? Math.round((totalGrammarScore / scoredGrammarCount) * 10.0) / 10.0 : 0.0;
		data.put("totalGrammarChecks", totalGrammarChecks);
		if (scoredGrammarCount > 0) {
			data.put("averageGrammarScore", avgGrammarScore);
		}

		// 5. XP, Level & Streak
		if (p != null) {
			data.put("xp", zeroIfNull(p.getXp()));
			data.put("level", Math.max(1, zeroIfNull(p.getLevel())));
			data.put("currentStreak", zeroIfNull(p.getCurrentStreak()));
			data.put("longestStreak", zeroIfNull(p.getLongestStreak()));
			data.put("totalPracticeMinutes", zeroIfNull(p.getTotalPracticeMinutes()));
		} else {
			data.put("xp", 0);
			data.put("level", 1);
			data.put("currentStreak", 0);
			data.put("longestStreak", 0);
			data.put("totalPracticeMinutes", 0);
		}
		return toJson(data);
	}

	private int zeroIfNull(Integer value) {
		return value == null ? 0 : value;
	}

	private Optional<Student> resolveStudent(ActorContext actor, Map<String, Object> params) {
		final Long scopedSchoolId = (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER)
				? actor.getSchoolId()
				: null;
		Long schoolId = scopedSchoolId;

		if (actor.getRole() == Role.TEACHER && actor.getTeacherId() != null) {
			return teacherAssignmentResolver.findAssignedStudent(actor.getTeacherId(), actor.getSchoolId(), params);
		}

		Optional<Student> byName = findByName(studentRepository.findAll(), params, schoolId);
		if (byName.isPresent()) {
			return byName;
		}

		String studentIdParam = strParam(params, "studentId");
		String rollNumber = strParam(params, "rollNumber");
		String idValue = !studentIdParam.isEmpty() ? studentIdParam : rollNumber;
		if (!idValue.isEmpty()) {
			if (schoolId != null) {
				Optional<Student> bySchoolAndId = studentRepository.findAll().stream()
						.filter(s -> schoolId.equals(s.getSchoolId()))
						.filter(s -> idValue.equalsIgnoreCase(s.getStudentId()) || idValue.equalsIgnoreCase(String.valueOf(s.getId())))
						.findFirst();
				if (bySchoolAndId.isPresent()) {
					return bySchoolAndId;
				}
			} else {
				Optional<Student> byId = studentRepository.findAll().stream()
						.filter(s -> idValue.equalsIgnoreCase(s.getStudentId()) || idValue.equalsIgnoreCase(String.valueOf(s.getId())))
						.findFirst();
				if (byId.isPresent()) {
					return byId;
				}
			}
		}

		// No arbitrary Super Admin fallback: if the request did not resolve to a
		// student (or named person) in scope, report "not found" rather than
		// silently selecting the first student in the table.
		return Optional.empty();
	}

	/**
		* Resolves a named person who is NOT a student (a platform USER, a School
		* Admin or a Teacher) from the base {@code users} table. Accepts the same
		* identifier keys as {@link #findByName} - {@code studentName}/{@code name}
		* and {@code studentEmail}/{@code email} - so a question that put an email in
		* the name slot still resolves. Scoped to the caller's school for School
		* Admins and Teachers; a Super Admin sees every user.
		*/
	private Optional<User> resolveUser(ActorContext actor, Map<String, Object> params) {
		String name = strParam(params, "studentName");
		if (name.isEmpty()) {
			name = strParam(params, "name");
		}
		String email = strParam(params, "studentEmail");
		if (email.isEmpty()) {
			email = strParam(params, "email");
		}
		if (email.isEmpty() && name.contains("@")) {
			email = name;
		}
		if (name.isEmpty() && email.isEmpty()) {
			return Optional.empty();
		}
		if (!name.isEmpty() && name.contains("@")) {
			name = "";
		}

		final Long scope = (actor.getRole() == Role.SCHOOL_ADMIN || actor.getRole() == Role.TEACHER)
				? actor.getSchoolId()
				: null;

		if (!email.isEmpty()) {
			Optional<User> byEmail = userRepository.findByEmail(email);
			if (byEmail.isPresent() && (scope == null || scope.equals(byEmail.get().getSchoolId()))) {
				return byEmail;
			}
		}

		final String needleName = name;
		final String needleEmail = email;
		return userRepository.findAll().stream()
				.filter(u -> !isStudent(u))
				.filter(u -> scope == null || scope.equals(u.getSchoolId()))
				.filter(u -> matchesUserIdentifier(u, needleName, needleEmail))
				.findFirst();
	}

	private boolean matchesUserIdentifier(User u, String name, String email) {
		if (!email.isEmpty() && u.getEmail() != null && u.getEmail().equalsIgnoreCase(email)) {
			return true;
		}
		if (!name.isEmpty() && !name.contains("@")
				&& fullName(u).toLowerCase(Locale.ROOT).contains(name.toLowerCase(Locale.ROOT))) {
			return true;
		}
		return false;
	}

	/**
		* Payload for a named person who has no student record. Includes a
		* {@code scope} key (so the synthesizer does not collapse this into its
		* generic "no data" reply), echoes the person's name so the answer is
		* unambiguous, and states their actual role together with the fact that XP
		* and learning metrics exist only for students.
		*/
	private Map<String, Object> nonStudentView(User u) {
		Map<String, Object> data = new LinkedHashMap<>();
		String name = fullName(u);
		String label = roleLabel(u.getRole());

		data.put("scope", "USER (id=" + u.getId() + ")");
		data.put("studentName", name);
		data.put("personName", name);
		data.put("personRole", label);
		data.put("notStudent", true);
		data.put("personEmail", u.getEmail());
		String school = u.getSchoolName();
		if (school != null && !school.isBlank()) {
			data.put("schoolName", school);
		}

		// Learning metrics are stored only on a Student's Progress row, so a
		// non-student genuinely has none. Report them as the real value 0 - exactly
		// as the student branch does when a student has no Progress row yet - so a
		// focused "total XP for <person>" question still returns a NUMBER ("XP: 0")
		// instead of degrading to the prose summary alone.
		data.put("xp", 0);
		data.put("level", 0);
		data.put("currentStreak", 0);
		data.put("longestStreak", 0);
		data.put("totalPracticeMinutes", 0);
		data.put("totalSpeakingSessions", 0);
		data.put("totalGrammarChecks", 0);
		data.put("totalVocabularyWords", 0);

		String summary = name + " is a " + label + " (email " + u.getEmail()
				+ "), not a student. XP, levels, streaks, lesson-completion and activity"
				+ " metrics are recorded only for student accounts, so there is no learning"
				+ " record (and therefore no XP) for this user.";
		if (school != null && !school.isBlank()) {
			summary = summary + " The account belongs to " + school + ".";
		}
		data.put("summary", summary);
		return data;
	}

	private String roleLabel(Role role) {
		if (role == null) {
			return "user";
		}
		return switch (role) {
			case SUPER_ADMIN -> "Super Admin";
			case SCHOOL_ADMIN -> "School Admin";
			case ADMIN -> "Admin";
			case TEACHER -> "Teacher";
			case STUDENT -> "Student";
			case USER -> "User";
		};
	}

	/**
		* A users-table row is a student when its role is STUDENT. Matched by role
		* rather than by the entity subtype because the lookup runs over {@code findAll()}
		* of the base table.
		*/
	private boolean isStudent(User u) {
		return u.getRole() == Role.STUDENT;
	}

	/**
	 * Resolves a student from the question's entity params. Accepted keys are
	 * {@code studentName} and {@code studentEmail}; an email pasted into the
	 * name slot ("what is total xp of siddhi.narke@gmail.com") is also handled.
	 * Matching is case-insensitive: the full name is matched by substring
	 * ("Siddhi Narke" -> "Siddhi Narke"), the email by exact address.
	 */
	private Optional<Student> findByName(List<Student> candidates, Map<String, Object> params, Long schoolId) {
		String name = strParam(params, "studentName");
		String email = strParam(params, "studentEmail");
		if (email.isEmpty() && name.contains("@")) {
			email = name;
		}
		if (name.isEmpty() && email.isEmpty()) {
			return Optional.empty();
		}
		final String needleName = name;
		final String needleEmail = email;
		List<Student> matches = candidates.stream()
				.filter(s -> schoolId == null || schoolId.equals(s.getSchoolId()))
				.filter(s -> matchesIdentifier(s, needleName, needleEmail))
				.collect(Collectors.toList());

		if (matches.isEmpty()) {
			return Optional.empty();
		}
		if (matches.size() == 1) {
			return Optional.of(matches.get(0));
		}
		// If multiple candidates match, prioritize active status and highest existing XP/activity
		matches.sort((a, b) -> {
			if (a.isActive() != b.isActive()) {
				return a.isActive() ? -1 : 1;
			}
			int xpA = progressRepository.findByStudent(a).map(Progress::getXp).orElse(0);
			int xpB = progressRepository.findByStudent(b).map(Progress::getXp).orElse(0);
			if (xpA != xpB) {
				return Integer.compare(xpB, xpA);
			}
			return Long.compare(b.getId(), a.getId());
		});
		return Optional.of(matches.get(0));
	}

	private boolean matchesIdentifier(Student s, String name, String email) {
		if (!email.isEmpty() && s.getEmail() != null
				&& s.getEmail().equalsIgnoreCase(email)) {
			return true;
		}
		// An email pasted into the name slot must never be substring-matched
		// against the full name.
		if (!name.isEmpty() && !name.contains("@")
				&& fullName(s).toLowerCase().contains(name.toLowerCase())) {
			return true;
		}
		return false;
	}

	private String fullName(User u) {
		String first = u.getFirstName() != null ? u.getFirstName() : "";
		String last = u.getLastName() != null ? u.getLastName() : "";
		return (first + " " + last).trim();
	}

	private String strParam(Map<String, Object> params, String key) {
		Object v = params.get(key);
		return v == null ? "" : v.toString().trim();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
