package com.rslsolution.speakmateai.service.email;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Condition that matches when 'app.mail.provider' is 'smtp' (case-insensitive) or unspecified (default).
 */
public class OnSmtpCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String explicitBrevo = context.getEnvironment().getProperty("brevo.enabled");
        if ("true".equalsIgnoreCase(explicitBrevo)) {
            return false;
        }
        String provider = context.getEnvironment().getProperty("app.email.provider");
        if (provider != null && "brevo".equalsIgnoreCase(provider.trim())) {
            return false;
        }
        if (provider == null || provider.isBlank()) {
            provider = context.getEnvironment().getProperty("app.mail.provider", "smtp");
        }
        return "smtp".equalsIgnoreCase(provider != null ? provider.trim() : "smtp");
    }
}
