package com.rslsolution.speakmateai.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rslsolution.speakmateai.dto.request.AdminUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminUserUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminUserResponse;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.dto.request.AdminUserDetailsUpdateRequest;
import com.rslsolution.speakmateai.dto.response.LanguageScoreResponse;
import com.rslsolution.speakmateai.dto.response.UserActivityResponse;
import com.rslsolution.speakmateai.dto.response.UserDetailsResponse;
import com.rslsolution.speakmateai.dto.response.UserGrammarResponse;
import com.rslsolution.speakmateai.dto.response.UserLearningStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserProgressResponse;
import com.rslsolution.speakmateai.dto.response.UserSpeakingResponse;
import com.rslsolution.speakmateai.dto.response.UserVocabularyResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;
import com.rslsolution.speakmateai.service.AdminUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminUserResponse> users = adminUserService.getAllUsers(page, size, sortBy, sortDir, null, null, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User created successfully", adminUserService.createUser(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", adminUserService.getUserById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminUserResponse> users = adminUserService.getAllUsers(page, size, sortBy, sortDir, keyword, null, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("Users searched successfully", users));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> filterUsers(
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String englishLevel,
            @RequestParam(required = false) String nativeLanguage,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime registrationFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime registrationTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminUserResponse> users = adminUserService.getAllUsers(page, size, sortBy, sortDir, null, status, englishLevel, nativeLanguage, purpose, registrationFrom, registrationTo);
        return ResponseEntity.ok(ApiResponse.success("Users filtered successfully", users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", adminUserService.updateUser(id, request)));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        adminUserService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully"));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        adminUserService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportUsers() {
        String csvData = adminUserService.exportUsersCsv();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "users_export.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getUserStatistics() {
        return ResponseEntity.ok(ApiResponse.success("User statistics retrieved successfully", adminUserService.getUserStatistics()));
    }

    // User Details & Analytics APIs
    @GetMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<UserDetailsResponse>> getUserDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User details retrieved successfully", adminUserService.getUserDetails(userId)));
    }

    @GetMapping("/{userId}/statistics")
    public ResponseEntity<ApiResponse<UserLearningStatisticsResponse>> getUserLearningStatistics(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User learning statistics retrieved successfully", adminUserService.getUserLearningStatistics(userId)));
    }

    @GetMapping("/{userId}/language-scores")
    public ResponseEntity<ApiResponse<LanguageScoreResponse>> getLanguageScores(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Language scores retrieved successfully", adminUserService.getLanguageScores(userId)));
    }

    @GetMapping("/{userId}/activities")
    public ResponseEntity<ApiResponse<Page<UserActivityResponse>>> getUserActivities(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("User activities retrieved successfully", adminUserService.getUserActivities(userId, page, size)));
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<ApiResponse<UserProgressResponse>> getUserProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User progress retrieved successfully", adminUserService.getUserProgress(userId)));
    }

    @GetMapping("/{userId}/speaking")
    public ResponseEntity<ApiResponse<UserSpeakingResponse>> getUserSpeakingDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User speaking details retrieved successfully", adminUserService.getUserSpeakingDetails(userId)));
    }

    @GetMapping("/{userId}/grammar")
    public ResponseEntity<ApiResponse<UserGrammarResponse>> getUserGrammarDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User grammar details retrieved successfully", adminUserService.getUserGrammarDetails(userId)));
    }

    @GetMapping("/{userId}/vocabulary")
    public ResponseEntity<ApiResponse<UserVocabularyResponse>> getUserVocabularyDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User vocabulary details retrieved successfully", adminUserService.getUserVocabularyDetails(userId)));
    }

    @PutMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<UserDetailsResponse>> updateUserDetails(@PathVariable Long userId, @Valid @RequestBody AdminUserDetailsUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User details updated successfully", adminUserService.updateUserDetails(userId, request)));
    }
}