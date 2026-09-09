package com.rslsolution.speakmateai.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rslsolution.speakmateai.dto.request.AdminSchoolUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminSchoolUserUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminSchoolUserResponse;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;
import com.rslsolution.speakmateai.service.AdminSchoolUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/school-users")
public class AdminSchoolUserController {

    private final AdminSchoolUserService adminSchoolUserService;

    public AdminSchoolUserController(AdminSchoolUserService adminSchoolUserService) {
        this.adminSchoolUserService = adminSchoolUserService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminSchoolUserResponse>>> getAllSchoolUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminSchoolUserResponse> users = adminSchoolUserService.getAllSchoolUsers(page, size, sortBy, sortDir, null, null, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("School Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminSchoolUserResponse>> getSchoolUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("School User retrieved successfully", adminSchoolUserService.getSchoolUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminSchoolUserResponse>> createSchoolUser(@Valid @RequestBody AdminSchoolUserCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("School User created successfully", adminSchoolUserService.createSchoolUser(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminSchoolUserResponse>> updateSchoolUser(@PathVariable Long id, @Valid @RequestBody AdminSchoolUserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("School User updated successfully", adminSchoolUserService.updateSchoolUser(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchoolUser(@PathVariable Long id) {
        adminSchoolUserService.deleteSchoolUser(id);
        return ResponseEntity.ok(ApiResponse.success("School User deleted (deactivated) successfully"));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AdminSchoolUserResponse>> activateSchoolUser(@PathVariable Long id) {
        AdminSchoolUserResponse response = adminSchoolUserService.activateStudent(id);
        return ResponseEntity.ok(ApiResponse.success("School User activated successfully", response));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdminSchoolUserResponse>> deactivateSchoolUser(@PathVariable Long id) {
        AdminSchoolUserResponse response = adminSchoolUserService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.success("School User deactivated successfully", response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<AdminSchoolUserResponse>>> searchSchoolUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminSchoolUserResponse> users = adminSchoolUserService.getAllSchoolUsers(page, size, sortBy, sortDir, keyword, null, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("School Users searched successfully", users));
    }

    @GetMapping("/standard/{standard}")
    public ResponseEntity<ApiResponse<Page<AdminSchoolUserResponse>>> getSchoolUsersByStandard(
            @PathVariable String standard,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminSchoolUserResponse> users = adminSchoolUserService.getAllSchoolUsers(page, size, sortBy, sortDir, null, standard, null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("School Users by standard retrieved successfully", users));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<AdminSchoolUserResponse>>> filterSchoolUsers(
            @RequestParam(required = false) String standard,
            @RequestParam(required = false) String division,
            @RequestParam(required = false) String schoolName,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime registrationFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime registrationTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Page<AdminSchoolUserResponse> users = adminSchoolUserService.getAllSchoolUsers(page, size, sortBy, sortDir, null, standard, division, schoolName, status, registrationFrom, registrationTo);
        return ResponseEntity.ok(ApiResponse.success("School Users filtered successfully", users));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getSchoolUserStatistics() {
        return ResponseEntity.ok(ApiResponse.success("School User statistics retrieved successfully", adminSchoolUserService.getSchoolUserStatistics()));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportSchoolUsers() {
        String csvData = adminSchoolUserService.exportSchoolUsersCsv();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "school_users_export.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
