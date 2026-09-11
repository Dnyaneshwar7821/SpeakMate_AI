package com.rslsolution.speakmateai.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import com.rslsolution.speakmateai.dto.request.AdminSchoolUserCreateRequest;
import com.rslsolution.speakmateai.dto.request.AdminSchoolUserUpdateRequest;
import com.rslsolution.speakmateai.dto.response.AdminSchoolUserResponse;
import com.rslsolution.speakmateai.dto.response.UserStatisticsResponse;

public interface AdminSchoolUserService {
    
    Page<AdminSchoolUserResponse> getAllSchoolUsers(int page, int size, String sortBy, String sortDir, 
                                                    String keyword, String standard, String division, String schoolName, 
                                                    Boolean status, LocalDateTime registrationFrom, LocalDateTime registrationTo);

    AdminSchoolUserResponse getSchoolUserById(Long id);

    AdminSchoolUserResponse createSchoolUser(AdminSchoolUserCreateRequest request);

    AdminSchoolUserResponse updateSchoolUser(Long id, AdminSchoolUserUpdateRequest request);

    void deleteSchoolUser(Long id);

    AdminSchoolUserResponse activateStudent(Long id);

    AdminSchoolUserResponse deactivateStudent(Long id);

    UserStatisticsResponse getSchoolUserStatistics();

    String exportSchoolUsersCsv();
}
