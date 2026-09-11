package com.rslsolution.speakmateai.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

	boolean existsByEmail(String email);

	boolean existsByEmailIgnoreCase(String email);

	Optional<User> findByEmail(String email);

	Optional<User> findByEmailIgnoreCase(String email);

	Optional<User> findByEmailVerificationToken(String token);

	Optional<User> findByResetPasswordToken(String resetPasswordToken);

	long countByActiveTrue();

	long countByActiveFalse();

	List<User> findByActiveTrue();

	long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

	@Query("SELECT COUNT(l) FROM LessonProgress l WHERE l.user.id = :userId AND l.completed = true")
	long countLessonProgressByUserId(@Param("userId") Long userId);

	@Query("SELECT COUNT(s) FROM SpeakingSession s WHERE s.user.id = :userId")
	long countSpeakingSessionsByUserId(@Param("userId") Long userId);

	@Query("SELECT COUNT(g) FROM GrammarHistory g WHERE g.user.id = :userId")
	long countGrammarHistoriesByUserId(@Param("userId") Long userId);

	@Query("SELECT COUNT(v) FROM Vocabulary v WHERE v.user.id = :userId")
	long countVocabularyByUserId(@Param("userId") Long userId);

	@Query("SELECT AVG(s.overallScore) FROM SpeakingSession s WHERE s.user.id = :userId AND s.overallScore IS NOT NULL")
	Double findAverageScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT u FROM User u WHERE u.role = com.rslsolution.speakmateai.enums.Role.STUDENT")
	List<User> findAllStudents();

	@Query("SELECT u FROM User u WHERE u.role = com.rslsolution.speakmateai.enums.Role.STUDENT AND u.schoolId = :schoolId")
	List<User> findAllStudentsBySchoolId(@Param("schoolId") Long schoolId);

	@Query("SELECT u FROM User u WHERE u.id = :id AND u.role = com.rslsolution.speakmateai.enums.Role.STUDENT")
	Optional<User> findStudentById(@Param("id") Long id);

	@Query("SELECT u FROM User u WHERE u.id = :id AND u.role = com.rslsolution.speakmateai.enums.Role.STUDENT AND u.schoolId = :schoolId")
	Optional<User> findStudentByIdAndSchoolId(@Param("id") Long id, @Param("schoolId") Long schoolId);

	@Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.rollNumber = :rollNumber AND u.role = com.rslsolution.speakmateai.enums.Role.STUDENT")
	boolean existsStudentByStudentId(@Param("rollNumber") String rollNumber);

	@Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.rollNumber = :rollNumber AND u.schoolId = :schoolId AND u.role = com.rslsolution.speakmateai.enums.Role.STUDENT")
	boolean existsStudentByStudentIdAndSchoolId(@Param("rollNumber") String rollNumber, @Param("schoolId") Long schoolId);

	@Query("SELECT u FROM User u WHERE u.schoolId = :schoolId AND u.role = :role")
	List<User> findBySchoolIdAndRole(@Param("schoolId") Long schoolId, @Param("role") Role role);

	List<User> findByRole(Role role);
}
