package com.rslsolution.speakmateai.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * ExpoPushService — sends push notifications via the Expo Push API.
 *
 * Expo's push API endpoint: https://exp.host/--/api/v2/push/send
 * Supports bulk sends (list of messages in one request).
 */
@Service
public class ExpoPushService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ExpoPushService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Send a single push notification to one Expo push token.
     *
     * @param expoPushToken  The Expo push token (e.g. "ExponentPushToken[xxxxxx]")
     * @param title          Notification title
     * @param body           Notification body text
     */
    public void sendPush(String expoPushToken, String title, String body) {
        if (expoPushToken == null || expoPushToken.isBlank()) return;

        try {
            Map<String, Object> message = Map.of(
                    "to", expoPushToken,
                    "sound", "default",
                    "title", title,
                    "body", body,
                    "data", Map.of("type", "SYSTEM")
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Accept-Encoding", "gzip, deflate");

            String payload = objectMapper.writeValueAsString(message);
            HttpEntity<String> entity = new HttpEntity<>(payload, headers);

            restTemplate.postForObject(EXPO_PUSH_URL, entity, String.class);
        } catch (Exception e) {
            System.err.println("⚠️ Expo push failed for token " + expoPushToken + ": " + e.getMessage());
        }
    }

    /**
     * Send the same notification to multiple Expo push tokens.
     *
     * @param tokens  List of Expo push tokens
     * @param title   Notification title
     * @param body    Notification body
     */
    public void sendPushBulk(List<String> tokens, String title, String body) {
        if (tokens == null || tokens.isEmpty()) return;

        try {
            List<Map<String, Object>> messages = tokens.stream()
                    .filter(t -> t != null && !t.isBlank())
                    .map(t -> (Map<String, Object>) Map.of(
                            "to", t,
                            "sound", "default",
                            "title", title,
                            "body", body,
                            "data", Map.of("type", "SYSTEM")
                    ))
                    .toList();

            if (messages.isEmpty()) return;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Accept-Encoding", "gzip, deflate");

            String payload = objectMapper.writeValueAsString(messages);
            HttpEntity<String> entity = new HttpEntity<>(payload, headers);

            restTemplate.postForObject(EXPO_PUSH_URL, entity, String.class);
        } catch (Exception e) {
            System.err.println("⚠️ Bulk Expo push failed: " + e.getMessage());
        }
    }
}
