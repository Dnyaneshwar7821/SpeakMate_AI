package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfileResponse {
	private IdentityResponse identity;
	private ProfessionalInfoResponse professionalInfo;
	private TeachingOverviewResponse teachingOverview;
	private ContactInfoResponse contactInfo;
	private AccountInfoResponse accountInfo;
	private UserPreferencesResponse userPreferences;
	private String bio;
	private Long schoolId;
	private String schoolName;
	private String assignedStandard;
}
