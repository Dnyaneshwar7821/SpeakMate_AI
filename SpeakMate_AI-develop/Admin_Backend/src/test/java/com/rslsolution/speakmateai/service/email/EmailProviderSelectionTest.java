package com.rslsolution.speakmateai.service.email;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class EmailProviderSelectionTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(JavaMailSender.class, () -> mock(JavaMailSender.class))
            .withBean(RestTemplate.class, () -> mock(RestTemplate.class))
            .withUserConfiguration(
                    EmailProviderValidationConfig.class,
                    SmtpEmailProvider.class,
                    BrevoEmailProvider.class
            );

    @Test
    @DisplayName("Test 1 — SMTP Selection: app.mail.provider=smtp selects SmtpEmailProvider")
    void testSmtpSelection() {
        contextRunner
                .withPropertyValues("app.mail.provider=smtp")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(EmailProvider.class);
                    assertThat(context).hasBean("smtpEmailProvider");
                    assertThat(context).doesNotHaveBean("brevoEmailProvider");
                    assertThat(context.getBean(EmailProvider.class)).isInstanceOf(SmtpEmailProvider.class);
                });
    }

    @Test
    @DisplayName("Test 1b — Default Selection: missing app.mail.provider defaults to SmtpEmailProvider")
    void testDefaultSelection() {
        contextRunner
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(EmailProvider.class);
                    assertThat(context).hasBean("smtpEmailProvider");
                    assertThat(context).doesNotHaveBean("brevoEmailProvider");
                    assertThat(context.getBean(EmailProvider.class)).isInstanceOf(SmtpEmailProvider.class);
                });
    }

    @Test
    @DisplayName("Test 2 — Brevo Selection: app.mail.provider=brevo selects BrevoEmailProvider")
    void testBrevoSelection() {
        contextRunner
                .withPropertyValues(
                        "app.mail.provider=brevo",
                        "brevo.api.key=dummy-test-key-for-selection-test",
                        "brevo.sender.email=sender@speakmate.com"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(EmailProvider.class);
                    assertThat(context).hasBean("brevoEmailProvider");
                    assertThat(context).doesNotHaveBean("smtpEmailProvider");
                    assertThat(context.getBean(EmailProvider.class)).isInstanceOf(BrevoEmailProvider.class);
                });
    }

    @Test
    @DisplayName("Test 3 — Invalid Provider: app.mail.provider=invalid fails configuration clearly")
    void testInvalidProvider() {
        contextRunner
                .withPropertyValues("app.mail.provider=invalid")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .getRootCause()
                            .isInstanceOf(IllegalArgumentException.class)
                            .hasMessageContaining("Invalid email provider configured in 'app.mail.provider': 'invalid'")
                            .hasMessageContaining("Supported providers are: 'smtp', 'brevo'");
                });
    }

    @Test
    @DisplayName("Test 4 — Missing Brevo API Key: app.mail.provider=brevo without key fails clearly")
    void testMissingBrevoApiKey() {
        contextRunner
                .withPropertyValues("app.mail.provider=brevo", "brevo.api.key=")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .getRootCause()
                            .isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("Brevo API key is not configured");
                });
    }

    @Test
    @DisplayName("Test 5 — Case-Insensitive Selection: app.mail.provider=SMTP selects SmtpEmailProvider")
    void testCaseInsensitiveSelection() {
        contextRunner
                .withPropertyValues("app.mail.provider=SMTP")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(EmailProvider.class);
                    assertThat(context).hasBean("smtpEmailProvider");
                    assertThat(context).doesNotHaveBean("brevoEmailProvider");
                    assertThat(context.getBean(EmailProvider.class)).isInstanceOf(SmtpEmailProvider.class);
                });

        contextRunner
                .withPropertyValues(
                        "app.mail.provider=BREVO",
                        "brevo.api.key=dummy-test-key-for-selection-test",
                        "brevo.sender.email=sender@speakmate.com"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(EmailProvider.class);
                    assertThat(context).hasBean("brevoEmailProvider");
                    assertThat(context).doesNotHaveBean("smtpEmailProvider");
                    assertThat(context.getBean(EmailProvider.class)).isInstanceOf(BrevoEmailProvider.class);
                });
    }
}
