package com.rslsolution.speakmateai.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import com.rslsolution.speakmateai.dto.request.AdminUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminUserUpdateRequest;
import com.rslsolution.speakmateai.dto.request.AdminUserDetailsUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminUserResponse;
import com.rslsolution.speakmateai.dto.response.LanguageScoreResponse;
import com.rslsolution.speakmateai.dto.response.UserActivityResponse;
import com.rslsolution.speakmateai.dto.response.UserDetailsResponse;
import com.rslsolution.speakmateai.dto.response.UserGrammarResponse;
import com.rslsolution.speakmateai.dto.response.UserLearningStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserProgressResponse;
import com.rslsolution.speakmateai.dto.response.UserSpeakingResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserVocabularyResponse;

public interface AdminUserService {
    
    Page<AdminUserResponse> getAllUsers(int page, int size, String sortBy, String sortDir,
                                        String keyword, Boolean status, String englishLevel,
                                        String nativeLanguage, String purpose,
                                        LocalDateTime registrationFrom, LocalDateTime registrationTo);

    AdminUserResponse createUser(AdminUserCreateRequest request);

    AdminUserResponse getUserById(Long id);

    AdminUserResponse updateUser(Long id, AdminUserUpdateRequest request);

    void activateUser(Long id);

    void deactivateUser(Long id);

    void deleteUser(Long id);

    String exportUsersCsv();

    UserStatisticsResponse getUserStatistics();

    // New API Methods for Admin User Details & Analytics
    UserDetailsResponse getUserDetails(Long userId);
    
    UserLearningStatisticsResponse getUserLearningStatistics(Long userId);
    
    LanguageScoreResponse getLanguageScores(Long userId);
    
    Page<UserActivityResponse> getUserActivities(Long userId, int page, int size);
    
    UserProgressResponse getUserProgress(Long userId);
    
    UserSpeakingResponse getUserSpeakingDetails(Long userId);
    
    UserGrammarResponse getUserGrammarDetails(Long userId);
    
    UserVocabularyResponse getUserVocabularyDetails(Long userId);
    
    UserDetailsResponse updateUserDetails(Long userId, AdminUserDetailsUpdateRequest request);
}
