package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.service.email.EmailMessage;

public interface EmailService {

    void sendEmail(String to, String subject, String text);

    void sendEmail(EmailMessage message);

    void sendAsyncEmail(EmailMessage message);

    default void sendAsyncEmail(String to, String subject, String text) {
        sendAsyncEmail(EmailMessage.plainText(to, subject, text));
    }

    default void sendHtmlEmail(String to, String subject, String htmlContent) {
        sendHtmlEmail(to, subject, htmlContent, null);
    }

    default void sendHtmlEmail(String to, String subject, String htmlContent, String textFallback) {
        sendEmail(EmailMessage.builder()
                .to(to)
                .subject(subject)
                .htmlContent(htmlContent)
                .text(textFallback != null && !textFallback.isBlank() ? textFallback : htmlContent)
                .html(true)
                .build());
    }

    default void sendAsyncHtmlEmail(String to, String subject, String htmlContent, String textFallback) {
        sendAsyncEmail(EmailMessage.builder()
                .to(to)
                .subject(subject)
                .htmlContent(htmlContent)
                .text(textFallback != null && !textFallback.isBlank() ? textFallback : htmlContent)
                .html(true)
                .build());
    }
}

