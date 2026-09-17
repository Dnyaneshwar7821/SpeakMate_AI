package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.integration.IntegrationResponse;
import com.rslsolution.speakmateai.dto.integration.MeetingSessionResponse;
import com.rslsolution.speakmateai.dto.integration.RazorpayTestOrderResponse;
import com.rslsolution.speakmateai.dto.integration.TestConnectionResponse;
import com.rslsolution.speakmateai.dto.integration.UpdateIntegrationRequest;

public interface PlatformIntegrationService {

	List<IntegrationResponse> getAllIntegrations();

	IntegrationResponse getIntegration(String integrationId);

	IntegrationResponse updateIntegration(String integrationId, UpdateIntegrationRequest request);

	TestConnectionResponse testConnection(String integrationId);

	RazorpayTestOrderResponse createRazorpayTestOrder();

	MeetingSessionResponse createTeamsMeeting(String topic);

	MeetingSessionResponse createGoogleMeet(String topic);
}
