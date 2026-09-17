package com.rslsolution.speakmateai.assistant.provider;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;

/**
 * The STUDENT caller's own progress. This provider is routed explicitly by the
 * registry for the STUDENT role and is never reachable via a generic lookup, so
 * a student can only ever see their own data.
 */
@Component
public class SelfProgressDataProvider implements AssistantDataProvider {

	private final StudentRepository studentRepository;
	private final ProgressRepository progressRepository;
	private final ObjectMapper objectMapper;

	public SelfProgressDataProvider(StudentRepository studentRepository,
			ProgressRepository progressRepository, ObjectMapper objectMapper) {
		this.studentRepository = studentRepository;
		this.progressRepository = progressRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.STUDENT_PERFORMANCE;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Optional<Student> me = studentRepository.findById(actor.getStudentId() == null ? -1L : actor.getStudentId());
		Map<String, Object> data = new LinkedHashMap<>();
		if (me.isEmpty()) {
			data.put("message", "NO DATA");
			data.put("reason", "Student profile not found.");
			return toJson(data);
		}

		Student s = me.get();
		Progress p = progressRepository.findByStudent(s).orElse(null);

		data.put("scope", "SELF (own progress only)");
		data.put("studentName", fullName(s));
		data.put("studentId", s.getStudentId());
		data.put("standard", s.getStandard());
		data.put("division", s.getDivision());
		if (p != null) {
			data.put("xp", zeroIfNull(p.getXp()));
			data.put("level", zeroIfNull(p.getLevel()));
			data.put("currentStreak", zeroIfNull(p.getCurrentStreak()));
			data.put("longestStreak", zeroIfNull(p.getLongestStreak()));
			data.put("totalPracticeMinutes", zeroIfNull(p.getTotalPracticeMinutes()));
			data.put("totalSpeakingSessions", zeroIfNull(p.getTotalSpeakingSessions()));
			data.put("totalGrammarChecks", zeroIfNull(p.getTotalGrammarChecks()));
			data.put("totalVocabularyWords", zeroIfNull(p.getTotalVocabularyWords()));
		} else {
			// No Progress row yet means the student has not started practising, so every
			// metric is genuinely 0. Report the zeros rather than a "no progress record"
			// notice the reader would interpret as the value being unavailable.
			data.put("xp", 0);
			data.put("level", 0);
			data.put("currentStreak", 0);
			data.put("longestStreak", 0);
			data.put("totalPracticeMinutes", 0);
			data.put("totalSpeakingSessions", 0);
			data.put("totalGrammarChecks", 0);
			data.put("totalVocabularyWords", 0);
		}
		return toJson(data);
	}

	private int zeroIfNull(Integer value) {
		return value == null ? 0 : value;
	}

	private String fullName(Student s) {
		String first = s.getFirstName() != null ? s.getFirstName() : "";
		String last = s.getLastName() != null ? s.getLastName() : "";
		return (first + " " + last).trim();
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
