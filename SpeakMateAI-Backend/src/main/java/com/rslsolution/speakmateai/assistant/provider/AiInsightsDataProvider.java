package com.rslsolution.speakmateai.assistant.provider;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.dto.assistant.AssistantIntent;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;

/**
 * Answers questions about the School-Admin <b>AI Insights</b> page: average
 * fluency / pronunciation / vocabulary / grammar scores, active speaking time,
 * the speech-metric breakdown and the top speakers.
 *
 * <p>Read-only and scoped to a single school over a time range
 * ({@code 1m}, {@code 3m}, {@code 6m} or {@code 1y}; default {@code 6m}).
 */
@Component
public class AiInsightsDataProvider implements AssistantDataProvider {

	private static final Map<String, Integer> RANGE_MONTHS = Map.of("1m", 1, "3m", 3, "6m", 6, "1y", 12);

	private final SpeakingSessionRepository speakingSessionRepository;
	private final SchoolRepository schoolRepository;
	private final ObjectMapper objectMapper;

	public AiInsightsDataProvider(SpeakingSessionRepository speakingSessionRepository, SchoolRepository schoolRepository,
			ObjectMapper objectMapper) {
		this.speakingSessionRepository = speakingSessionRepository;
		this.schoolRepository = schoolRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public AssistantIntent intent() {
		return AssistantIntent.AI_INSIGHTS;
	}

	@Override
	public String provide(ActorContext actor, Map<String, Object> params) {
		Map<String, Object> data = new LinkedHashMap<>();
		if (actor == null) {
			data.put("message", "NO DATA");
			data.put("reason", "Authenticated caller context is missing.");
			return toJson(data);
		}
		Long schoolId = resolveSchoolId(actor, params);
		if (schoolId == null) {
			data.put("message", "NO DATA");
			data.put("reason", "No school scope is available for this caller.");
			return toJson(data);
		}

		String range = strParam(params, "range");
		if (range == null) {
			range = strParam(params, "timeRange");
		}
		if (range == null || !RANGE_MONTHS.containsKey(range)) {
			range = "6m";
		}
		int months = RANGE_MONTHS.get(range);
		LocalDateTime end = LocalDateTime.now();
		LocalDateTime start = end.minusMonths(months);
		List<SpeakingSession> sessions = speakingSessionRepository.findSchoolSessionsBetween(schoolId, start, end);

		double fluency = round(average(validScores(sessions, SpeakingSession::getFluencyScore)));
		double pronunciation = round(average(validScores(sessions, SpeakingSession::getPronunciationScore)));
		double vocabulary = round(average(validScores(sessions, SpeakingSession::getVocabularyScore)));
		double grammar = round(average(validScores(sessions, SpeakingSession::getGrammarScore)));
		long speakingTimeSeconds = sessions.stream().map(SpeakingSession::getDuration)
				.filter(v -> v != null && v > 0).mapToLong(Integer::longValue).sum();

		List<Map<String, Object>> speechMetrics = new ArrayList<>();
		speechMetrics.add(speechMetric("Fluency", fluency));
		speechMetrics.add(speechMetric("Pronunciation", pronunciation));
		speechMetrics.add(speechMetric("Vocabulary", vocabulary));
		speechMetrics.add(speechMetric("Grammar", grammar));

		School school = schoolRepository.findById(schoolId).orElse(null);
		String schoolName = school != null
				? (school.getName() != null && !school.getName().isBlank() ? school.getName() : school.getSchoolName())
				: null;

		data.put("scope", "SCHOOL (AI insights for the caller's school)");
		data.put("schoolId", schoolId);
		data.put("schoolName", schoolName);
		data.put("range", range);
		data.put("sessionCount", (long) sessions.size());
		data.put("fluency", fluency);
		data.put("pronunciation", pronunciation);
		data.put("vocabulary", vocabulary);
		data.put("grammar", grammar);
		data.put("speakingTimeSeconds", speakingTimeSeconds);
		data.put("speakingTimeMinutes", round(speakingTimeSeconds / 60.0));
		data.put("speechMetrics", speechMetrics);
		data.put("topSpeakers", topSpeakers(sessions));
		// No word-level error data exists anywhere in the schema (a SpeakingSession
		// persists aggregate fluency/pronunciation/vocabulary/grammar scores only),
		// so there is no legitimate source for a mispronounced-word list. Return an
		// explicit empty list plus an availability flag so the answer states that the
		// underlying data is unavailable instead of implying or inventing words.
		data.put("mispronouncedWords", List.of());
		data.put("mispronouncedWordsAvailable", false);
		data.put("summary", "Across " + sessions.size() + " speaking sessions in the last " + months
				+ " months, average fluency is " + fluency + ", pronunciation " + pronunciation + ", vocabulary "
				+ vocabulary + " and grammar " + grammar + ", with " + speakingTimeSeconds
				+ " seconds of active speaking time.");
		return toJson(data);
	}

	private List<Map<String, Object>> topSpeakers(List<SpeakingSession> sessions) {
		Map<Long, List<SpeakingSession>> byStudent = new LinkedHashMap<>();
		for (SpeakingSession s : sessions) {
			User student = s.getUser();
			if (student != null && student.getId() != null) {
				byStudent.computeIfAbsent(student.getId(), k -> new ArrayList<>()).add(s);
			}
		}
		List<Map<String, Object>> speakers = new ArrayList<>();
		byStudent.forEach((id, studentSessions) -> {
			User student = studentSessions.get(0).getUser();
			double score = round(average(validScores(studentSessions, SpeakingSession::getPronunciationScore)));
			if (score <= 0) {
				return;
			}
			Map<String, Object> entry = new LinkedHashMap<>();
			entry.put("name", fullName(student));
			if (student.getStandard() != null && !student.getStandard().isBlank()) {
				entry.put("standard", student.getStandard());
			}
			entry.put("score", score);
			entry.put("sessions", (long) studentSessions.size());
			speakers.add(entry);
		});
		speakers.sort(Comparator.comparingDouble((Map<String, Object> e) -> ((Number) e.get("score")).doubleValue())
				.reversed());
		return speakers.size() > 5 ? new ArrayList<>(speakers.subList(0, 5)) : speakers;
	}

	private List<Double> validScores(List<SpeakingSession> sessions, Function<SpeakingSession, Double> fn) {
		List<Double> scores = new ArrayList<>();
		for (SpeakingSession s : sessions) {
			Double v = fn.apply(s);
			if (v != null && Double.isFinite(v)) {
				scores.add(v);
			}
		}
		return scores;
	}

	private double average(List<Double> values) {
		return values.isEmpty() ? 0.0 : values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
	}

	private Map<String, Object> speechMetric(String name, double score) {
		Map<String, Object> entry = new LinkedHashMap<>();
		entry.put("metric", name);
		entry.put("score", score);
		return entry;
	}

	private String fullName(User user) {
		String first = user.getFirstName() != null ? user.getFirstName() : "";
		String last = user.getLastName() != null ? user.getLastName() : "";
		String name = (first + " " + last).trim();
		return name.isEmpty() ? "Student" : name;
	}

	private Long resolveSchoolId(ActorContext actor, Map<String, Object> params) {
		if (actor.getSchoolId() != null) {
			return actor.getSchoolId();
		}
		String name = strParam(params, "schoolName");
		if (name != null) {
			return schoolRepository.findByName(name).map(School::getId)
					.orElseGet(() -> schoolRepository.findAll().stream()
							.filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(name))
							.map(School::getId).findFirst().orElse(null));
		}
		return null;
	}

	private String strParam(Map<String, Object> params, String key) {
		if (params == null) {
			return null;
		}
		Object value = params.get(key);
		if (value == null) {
			return null;
		}
		String s = String.valueOf(value).trim();
		return s.isEmpty() ? null : s;
	}

	private double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}

	private String toJson(Map<String, Object> data) {
		try {
			return objectMapper.writeValueAsString(data);
		} catch (JsonProcessingException e) {
			return "NO DATA";
		}
	}
}
