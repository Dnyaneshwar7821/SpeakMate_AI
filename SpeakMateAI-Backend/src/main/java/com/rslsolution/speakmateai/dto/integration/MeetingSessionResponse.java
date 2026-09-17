package com.rslsolution.speakmateai.dto.integration;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingSessionResponse {
	private String provider; // TEAMS, GOOGLE_MEET
	private String joinUrl;
	private String meetingCode;
	private String topic;
	private String domainLock;
	private LocalDateTime createdAt;
	private String status;
}
