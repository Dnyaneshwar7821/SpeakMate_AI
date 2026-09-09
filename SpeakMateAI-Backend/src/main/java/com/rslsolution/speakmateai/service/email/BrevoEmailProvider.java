package com.rslsolution.speakmateai.service.email;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Brevo (formerly Sendinblue) HTTP transactional email provider.
 * Active when app.mail.provider is 'brevo' (case-insensitive).
 * Dispatches emails via Brevo v3 REST API: POST https://api.brevo.com/v3/smtp/email
 */
@Component("brevoEmailProvider")
@Conditional(OnBrevoCondition.class)
public class BrevoEmailProvider implements EmailProvider {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BrevoEmailProvider.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String defaultSenderEmail;
    private final String defaultSenderName;

    @Autowired
    public BrevoEmailProvider(
            @Autowired(required = false) RestTemplate restTemplate,
            @Value("${brevo.api.url:https://api.brevo.com/v3}") String apiUrl,
            @Value("${brevo.api.key:${BREVO_API_KEY:}}") String apiKey,
            @Value("${brevo.sender.email:${spring.mail.username:dnyaneshwaralgule2003@gmail.com}}") String defaultSenderEmail,
            @Value("${brevo.sender.name:SpeakMateAI}") String defaultSenderName) {
        this.restTemplate = restTemplate != null ? restTemplate : createDefaultRestTemplate();
        this.apiUrl = (apiUrl != null && !apiUrl.isBlank()) ? apiUrl.trim() : "https://api.brevo.com/v3";
        this.apiKey = apiKey;
        this.defaultSenderEmail = (defaultSenderEmail != null && !defaultSenderEmail.isBlank())
                ? defaultSenderEmail.trim()
                : "dnyaneshwaralgule2003@gmail.com";
        this.defaultSenderName = (defaultSenderName != null && !defaultSenderName.isBlank())
                ? defaultSenderName.trim()
                : "SpeakMateAI";
    }

    private static RestTemplate createDefaultRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return new RestTemplate(new org.springframework.http.client.BufferingClientHttpRequestFactory(factory));
    }

    @Override
    public void send(EmailMessage message) {
        if (message == null) {
            throw new IllegalArgumentException("EmailMessage cannot be null");
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Brevo API key is not configured. Please set the BREVO_API_KEY environment variable.");
        }

        if (message.getTo() == null || message.getTo().isBlank()) {
            throw new IllegalArgumentException("Recipient email ('to') cannot be empty");
        }

        String recipient = message.getTo().trim();
        String senderEmail = (message.getFrom() != null && !message.getFrom().isBlank())
                ? message.getFrom().trim()
                : defaultSenderEmail;
        String senderName = (message.getSenderName() != null && !message.getSenderName().isBlank())
                ? message.getSenderName().trim()
                : defaultSenderName;

        if (senderEmail == null || senderEmail.isBlank()) {
            throw modernSenderException();
        }

        BrevoPayload payload = buildPayload(message, senderEmail, senderName, recipient);
        String endpoint = resolveEndpoint();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey.trim());
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<BrevoPayload> requestEntity = new HttpEntity<>(payload, headers);

        try {
            log.info("Sending email via Brevo API to recipient: {}, isHtml: {}", recipient, message.isHtml());
            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                String messageId = null;
                if (response.getBody() != null && response.getBody().containsKey("messageId")) {
                    messageId = String.valueOf(response.getBody().get("messageId"));
                }
                log.info("Brevo email dispatched successfully to: {}, status: {}, messageId: {}",
                        recipient, response.getStatusCode(), messageId);
            } else {
                log.error("Brevo API returned non-2xx status: {} for recipient: {}",
                        response.getStatusCode(), recipient);
                throw new RuntimeException("Brevo email delivery failed with status: " + response.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("Brevo API HTTP error: {} - {} for recipient: {}. Response: {}",
                    e.getStatusCode(), e.getStatusText(), recipient, responseBody);
            String detail = (responseBody != null && !responseBody.isBlank()) ? responseBody : e.getStatusText();
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(detail);
                if (node.has("message")) {
                    detail = node.get("message").asText();
                }
            } catch (Exception ignored) {}
            throw new RuntimeException("Brevo error: " + detail, e);
        } catch (ResourceAccessException e) {
            log.error("Brevo API connection or timeout failure for recipient: {}: {}",
                    recipient, e.getMessage());
            throw new RuntimeException("Connection/timeout error while contacting Brevo API: " + e.getMessage(), e);
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof IllegalArgumentException || e instanceof IllegalStateException)) {
                throw (RuntimeException) e;
            }
            log.error("Unexpected error during Brevo email delivery to {}: {}", recipient, e.getMessage());
            throw new RuntimeException("Brevo email delivery failed: " + e.getMessage(), e);
        }
    }

    private BrevoPayload buildPayload(EmailMessage message, String senderEmail, String senderName, String recipient) {
        BrevoSender sender = new BrevoSender(senderEmail, senderName);
        List<BrevoRecipient> toList = Collections.singletonList(new BrevoRecipient(recipient, null));

        BrevoPayload.BrevoPayloadBuilder builder = BrevoPayload.builder()
                .sender(sender)
                .to(toList)
                .subject(message.getSubject());

        // Strictly HTML format - no plain text format
        String htmlContent = message.getHtmlContent();
        if (htmlContent == null || htmlContent.isBlank()) {
            String rawText = message.getText() != null ? message.getText() : message.getBody();
            htmlContent = wrapTextInBrandedHtml(message.getSubject(), rawText);
        }
        builder.htmlContent(htmlContent);

        return builder.build();
    }

    private String wrapTextInBrandedHtml(String subject, String text) {
        String safeSubject = subject != null ? org.springframework.web.util.HtmlUtils.htmlEscape(subject) : "SpeakMate AI Notification";
        String safeBody;
        if (text != null && !text.isBlank()) {
            safeBody = org.springframework.web.util.HtmlUtils.htmlEscape(text).replace("\r\n", "\n").replace("\n", "<br/>");
        } else {
            safeBody = "";
        }

        return "<!DOCTYPE html>\n"
                + "<html lang=\"en\">\n"
                + "<head>\n"
                + "  <meta charset=\"UTF-8\">\n"
                + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
                + "  <title>" + safeSubject + "</title>\n"
                + "  <style>\n"
                + "    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }\n"
                + "    .wrapper { width: 100%; background-color: #f8fafc; padding: 32px 12px; box-sizing: border-box; }\n"
                + "    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }\n"
                + "    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff; }\n"
                + "    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }\n"
                + "    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }\n"
                + "    .footer { background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }\n"
                + "  </style>\n"
                + "</head>\n"
                + "<body>\n"
                + "<div class=\"wrapper\">\n"
                + "  <div class=\"container\">\n"
                + "    <div class=\"header\">\n"
                + "      <h1>SpeakMate AI</h1>\n"
                + "    </div>\n"
                + "    <div class=\"content\">\n"
                + "      " + safeBody + "\n"
                + "    </div>\n"
                + "    <div class=\"footer\">\n"
                + "      <p>SpeakMate AI &bull; AI-Powered Interactive English Learning</p>\n"
                + "      <p>&copy; 2026 SpeakMate AI. All rights reserved.</p>\n"
                + "    </div>\n"
                + "  </div>\n"
                + "</div>\n"
                + "</body>\n"
                + "</html>";
    }

    private String resolveEndpoint() {
        String base = apiUrl.endsWith("/") ? apiUrl.substring(0, apiUrl.length() - 1) : apiUrl;
        return base + "/smtp/email";
    }

    private IllegalStateException modernSenderException() {
        return new IllegalStateException("Brevo sender email is not configured. Please set the brevo.sender.email property.");
    }

    // ==========================================
    // Brevo API DTOs (Provider-Internal)
    // ==========================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BrevoPayload {
        private BrevoSender sender;
        private List<BrevoRecipient> to;
        private String subject;
        private String htmlContent;
        private String textContent;

        public BrevoSender getSender() { return sender; }
        public void setSender(BrevoSender sender) { this.sender = sender; }

        public List<BrevoRecipient> getTo() { return to; }
        public void setTo(List<BrevoRecipient> to) { this.to = to; }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getHtmlContent() { return htmlContent; }
        public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }

        public String getTextContent() { return textContent; }
        public void setTextContent(String textContent) { this.textContent = textContent; }

        public static BrevoPayloadBuilder builder() {
            return new BrevoPayloadBuilder();
        }

        public static class BrevoPayloadBuilder {
            private BrevoSender sender;
            private List<BrevoRecipient> to;
            private String subject;
            private String htmlContent;
            private String textContent;

            public BrevoPayloadBuilder sender(BrevoSender sender) { this.sender = sender; return this; }
            public BrevoPayloadBuilder to(List<BrevoRecipient> to) { this.to = to; return this; }
            public BrevoPayloadBuilder subject(String subject) { this.subject = subject; return this; }
            public BrevoPayloadBuilder htmlContent(String htmlContent) { this.htmlContent = htmlContent; return this; }
            public BrevoPayloadBuilder textContent(String textContent) { this.textContent = textContent; return this; }

            public BrevoPayload build() {
                BrevoPayload p = new BrevoPayload();
                p.setSender(sender);
                p.setTo(to);
                p.setSubject(subject);
                p.setHtmlContent(htmlContent);
                p.setTextContent(textContent);
                return p;
            }
        }
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BrevoSender {
        private String email;
        private String name;

        public BrevoSender() {}
        public BrevoSender(String email, String name) {
            this.email = email;
            this.name = name;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BrevoRecipient {
        private String email;
        private String name;

        public BrevoRecipient() {}
        public BrevoRecipient(String email, String name) {
            this.email = email;
            this.name = name;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
