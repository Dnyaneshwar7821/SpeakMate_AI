package com.rslsolution.speakmateai.service.impl;

import com.rslsolution.speakmateai.service.EmailService;
import com.rslsolution.speakmateai.service.email.EmailMessage;
import com.rslsolution.speakmateai.service.email.EmailProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final EmailProvider emailProvider;

    @Override
    public void sendEmail(String to, String subject, String text) {
        emailProvider.send(EmailMessage.html(to, subject, text));
    }

    @Override
    public void sendEmail(EmailMessage message) {
        emailProvider.send(message);
    }

    @Override
    public void sendAsyncEmail(EmailMessage message) {
        CompletableFuture.runAsync(() -> {
            try {
                emailProvider.send(message);
            } catch (Exception e) {
                log.error("Failed to send async email to {}: {}", message != null ? message.getTo() : "null", e.getMessage(), e);
            }
        });
    }
}


