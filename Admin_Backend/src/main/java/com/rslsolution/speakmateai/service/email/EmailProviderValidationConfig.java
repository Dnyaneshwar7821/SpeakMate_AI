package com.rslsolution.speakmateai.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Validates email provider configuration at application startup.
 * Enforces supported values ('smtp', 'brevo') and verifies required secrets.
 */
@Slf4j
@Configuration
public class EmailProviderValidationConfig {

    public EmailProviderValidationConfig(
            @Value("${app.email.provider:${app.mail.provider:smtp}}") String provider,
            @Value("${brevo.enabled:false}") String brevoEnabled,
            @Value("${brevo.api.key:${BREVO_API_KEY:}}") String brevoApiKey,
            @Value("${brevo.sender.email:${spring.mail.username:dnyaneshwaralgule2003@gmail.com}}") String brevoSenderEmail) {

        if ("true".equalsIgnoreCase(brevoEnabled)) {
            provider = "brevo";
        }
        String normalized = provider != null ? provider.trim().toLowerCase() : "smtp";

        if (!"smtp".equals(normalized) && !"brevo".equals(normalized)) {
            throw new IllegalArgumentException(
                    "Invalid email provider configured in 'app.mail.provider': '" + provider + "'. Supported providers are: 'smtp', 'brevo'."
            );
        }

        if ("brevo".equals(normalized)) {
            if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
                throw new IllegalStateException(
                        "Brevo API key is not configured. Please set the BREVO_API_KEY environment variable when app.mail.provider=brevo."
                );
            }
            if (brevoSenderEmail == null || brevoSenderEmail.trim().isEmpty()) {
                throw new IllegalStateException(
                        "Brevo sender email is not configured. Please set the brevo.sender.email property when app.mail.provider=brevo."
                );
            }
            log.info("Email provider successfully configured: brevo");
        } else {
            log.info("Email provider successfully configured: smtp");
        }
    }
}
