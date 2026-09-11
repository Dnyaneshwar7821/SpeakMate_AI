package com.rslsolution.speakmateai.service.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrevoEmailProviderTest {

    @Mock
    private RestTemplate restTemplate;

    private BrevoEmailProvider brevoEmailProvider;

    private static final String API_URL = "https://api.brevo.com/v3";
    private static final String API_KEY = "test-brevo-api-key-placeholder";
    private static final String SENDER_EMAIL = "sender@speakmate.com";
    private static final String SENDER_NAME = "SpeakMateAI";

    @BeforeEach
    void setUp() {
        brevoEmailProvider = new BrevoEmailProvider(
                restTemplate,
                API_URL,
                API_KEY,
                SENDER_EMAIL,
                SENDER_NAME
        );
    }

    @Test
    @DisplayName("Test 1 — Plain text input is automatically wrapped in HTML format; textContent is strictly null")
    void testPlainTextEmail() {
        EmailMessage message = EmailMessage.plainText(
                "user@example.com",
                "Teacher Account Credentials",
                "Hello Teacher, your credentials are..."
        );

        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(new ResponseEntity<>(Map.of("messageId", "<msg-123>"), HttpStatus.CREATED));

        brevoEmailProvider.send(message);

        ArgumentCaptor<HttpEntity<BrevoEmailProvider.BrevoPayload>> captor =
                ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                captor.capture(),
                eq(Map.class)
        );

        HttpEntity<BrevoEmailProvider.BrevoPayload> captured = captor.getValue();
        assertNotNull(captured);

        // Verify headers
        assertEquals("test-brevo-api-key-placeholder", captured.getHeaders().getFirst("api-key"));
        assertEquals("application/json", captured.getHeaders().getContentType().toString());

        // Verify body payload
        BrevoEmailProvider.BrevoPayload payload = captured.getBody();
        assertNotNull(payload);
        assertEquals("sender@speakmate.com", payload.getSender().getEmail());
        assertEquals("SpeakMateAI", payload.getSender().getName());
        assertEquals(1, payload.getTo().size());
        assertEquals("user@example.com", payload.getTo().get(0).getEmail());
        assertEquals("Teacher Account Credentials", payload.getSubject());
        assertNull(payload.getTextContent(), "textContent must be null: strictly HTML format only");
        assertNotNull(payload.getHtmlContent(), "htmlContent must be generated and present");
        assertTrue(payload.getHtmlContent().contains("Hello Teacher, your credentials are..."));
    }

    @Test
    @DisplayName("Test 2 — HTML Email produces htmlContent and no textContent")
    void testHtmlEmail() {
        EmailMessage message = EmailMessage.html(
                "student@example.com",
                "Verify Your Email - SpeakMateAI",
                "<html><body><h1>Your OTP: 123456</h1></body></html>",
                "SpeakMateAI Support"
        );

        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(new ResponseEntity<>(Map.of("messageId", "<msg-456>"), HttpStatus.CREATED));

        brevoEmailProvider.send(message);

        ArgumentCaptor<HttpEntity<BrevoEmailProvider.BrevoPayload>> captor =
                ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                captor.capture(),
                eq(Map.class)
        );

        BrevoEmailProvider.BrevoPayload payload = captor.getValue().getBody();
        assertNotNull(payload);
        assertEquals("sender@speakmate.com", payload.getSender().getEmail());
        assertEquals("SpeakMateAI Support", payload.getSender().getName());
        assertEquals(1, payload.getTo().size());
        assertEquals("student@example.com", payload.getTo().get(0).getEmail());
        assertEquals("Verify Your Email - SpeakMateAI", payload.getSubject());
        assertEquals("<html><body><h1>Your OTP: 123456</h1></body></html>", payload.getHtmlContent());
        assertNull(payload.getTextContent(), "textContent must NOT be present for HTML email");
    }

    @Test
    @DisplayName("Test 3 — Successful Brevo Response handling")
    void testSuccessfulBrevoResponse() {
        EmailMessage message = EmailMessage.plainText(
                "success@example.com",
                "Welcome",
                "Welcome to the platform"
        );

        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(new ResponseEntity<>(Map.of("messageId", "<20260903.success@brevo.com>"), HttpStatus.CREATED));

        // Execution should complete without exception
        brevoEmailProvider.send(message);

        verify(restTemplate).exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        );
    }

    @Test
    @DisplayName("Test 4 — Brevo 4xx/5xx Error throws appropriate exception")
    void testBrevoErrorHandling() {
        EmailMessage message = EmailMessage.plainText(
                "error@example.com",
                "Notice",
                "Important notice"
        );

        HttpClientErrorException clientError = HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                null,
                "{\"message\":\"Invalid recipient\"}".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(clientError);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> brevoEmailProvider.send(message));
        assertTrue(ex.getMessage().contains("400"), "Exception should contain HTTP status code");

        // Also verify 5xx server error
        HttpServerErrorException serverError = HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                null,
                "{\"message\":\"Server down\"}".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        when(restTemplate.exchange(
                eq("https://api.brevo.com/v3/smtp/email"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(serverError);

        RuntimeException serverEx = assertThrows(RuntimeException.class, () -> brevoEmailProvider.send(message));
        assertTrue(serverEx.getMessage().contains("500"), "Exception should contain 500 status code");
    }

    @Test
    @DisplayName("Test 5 — Missing or empty API Key throws IllegalStateException without logging key")
    void testMissingApiKey() {
        BrevoEmailProvider unconfiguredProvider = new BrevoEmailProvider(
                restTemplate,
                API_URL,
                "",  // empty API key
                SENDER_EMAIL,
                SENDER_NAME
        );

        EmailMessage message = EmailMessage.plainText("test@example.com", "Subject", "Body");

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> unconfiguredProvider.send(message)
        );
        assertTrue(ex.getMessage().contains("Brevo API key is not configured"));

        // Null API key check
        BrevoEmailProvider nullKeyProvider = new BrevoEmailProvider(
                restTemplate,
                API_URL,
                null,  // null API key
                SENDER_EMAIL,
                SENDER_NAME
        );

        IllegalStateException nullEx = assertThrows(
                IllegalStateException.class,
                () -> nullKeyProvider.send(message)
        );
        assertTrue(nullEx.getMessage().contains("Brevo API key is not configured"));
    }
}
