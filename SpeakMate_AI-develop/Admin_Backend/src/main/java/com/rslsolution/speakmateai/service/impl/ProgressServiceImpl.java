package com.rslsolution.speakmateai.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.ProgressRequest;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.exception.ProgressNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.service.ProgressService;

@Service
@Transactional
public class ProgressServiceImpl implements ProgressService {

	private final ProgressRepository progressRepository;
	private final StudentRepository studentRepository;

	public ProgressServiceImpl(ProgressRepository progressRepository, StudentRepository studentRepository) {
		this.progressRepository = progressRepository;
		this.studentRepository = studentRepository;
	}

	@Override
	public ProgressResponse createProgress(ProgressRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		Student user = studentRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		Progress progress = Progress.builder().student(user).xp(request.getXp()).level(request.getLevel())
				.currentStreak(request.getCurrentStreak()).longestStreak(request.getLongestStreak())
				.totalPracticeMinutes(request.getTotalPracticeMinutes())
				.totalSpeakingSessions(request.getTotalSpeakingSessions())
				.totalGrammarChecks(request.getTotalGrammarChecks())
				.totalVocabularyWords(request.getTotalVocabularyWords()).build();

		Progress savedProgress = progressRepository.save(progress);

		return ProgressResponse.builder().id(savedProgress.getId()).xp(savedProgress.getXp())
				.level(savedProgress.getLevel()).currentStreak(savedProgress.getCurrentStreak())
				.longestStreak(savedProgress.getLongestStreak())
				.totalPracticeMinutes(savedProgress.getTotalPracticeMinutes())
				.totalSpeakingSessions(savedProgress.getTotalSpeakingSessions())
				.totalGrammarChecks(savedProgress.getTotalGrammarChecks())
				.totalVocabularyWords(savedProgress.getTotalVocabularyWords()).createdAt(savedProgress.getCreatedAt())
				.updatedAt(savedProgress.getUpdatedAt()).build();
	}

	@Override
	public ProgressResponse getProgress() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		Student user = studentRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		Progress progress = progressRepository.findByStudent(user)
				.orElseGet(() -> {
					Progress newProgress = Progress.builder()
							.student(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build();
					return progressRepository.save(newProgress);
				});

		return ProgressResponse.builder().id(progress.getId()).xp(progress.getXp()).level(progress.getLevel())
				.currentStreak(progress.getCurrentStreak()).longestStreak(progress.getLongestStreak())
				.totalPracticeMinutes(progress.getTotalPracticeMinutes())
				.totalSpeakingSessions(progress.getTotalSpeakingSessions())
				.totalGrammarChecks(progress.getTotalGrammarChecks())
				.totalVocabularyWords(progress.getTotalVocabularyWords()).createdAt(progress.getCreatedAt())
				.updatedAt(progress.getUpdatedAt()).build();
	}

	@Override
	public ProgressResponse updateProgress(ProgressRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		Student user = studentRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		Progress progress = progressRepository.findByStudent(user)
				.orElseGet(() -> {
					Progress newProgress = Progress.builder()
							.student(user)
							.xp(0)
							.level(1)
							.currentStreak(0)
							.longestStreak(0)
							.totalPracticeMinutes(0)
							.totalSpeakingSessions(0)
							.totalGrammarChecks(0)
							.totalVocabularyWords(0)
							.build();
					return progressRepository.save(newProgress);
				});

		progress.setXp(request.getXp());
		progress.setLevel(request.getLevel());
		progress.setCurrentStreak(request.getCurrentStreak());
		progress.setLongestStreak(request.getLongestStreak());
		progress.setTotalPracticeMinutes(request.getTotalPracticeMinutes());
		progress.setTotalSpeakingSessions(request.getTotalSpeakingSessions());
		progress.setTotalGrammarChecks(request.getTotalGrammarChecks());
		progress.setTotalVocabularyWords(request.getTotalVocabularyWords());

		Progress updatedProgress = progressRepository.save(progress);

		return ProgressResponse.builder().id(updatedProgress.getId()).xp(updatedProgress.getXp())
				.level(updatedProgress.getLevel()).currentStreak(updatedProgress.getCurrentStreak())
				.longestStreak(updatedProgress.getLongestStreak())
				.totalPracticeMinutes(updatedProgress.getTotalPracticeMinutes())
				.totalSpeakingSessions(updatedProgress.getTotalSpeakingSessions())
				.totalGrammarChecks(updatedProgress.getTotalGrammarChecks())
				.totalVocabularyWords(updatedProgress.getTotalVocabularyWords())
				.createdAt(updatedProgress.getCreatedAt()).updatedAt(updatedProgress.getUpdatedAt()).build();
	}

	@Override
	public void deleteProgress() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		Student user = studentRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("Student not found"));

		Progress progress = progressRepository.findByStudent(user)
				.orElseThrow(() -> new ProgressNotFoundException("Progress not found"));

		progressRepository.delete(progress);
	}
}