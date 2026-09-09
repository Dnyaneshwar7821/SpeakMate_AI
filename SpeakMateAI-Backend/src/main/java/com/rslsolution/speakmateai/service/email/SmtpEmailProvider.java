package com.rslsolution.speakmateai.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

/**
 * SMTP implementation of EmailProvider using Spring JavaMailSender.
 * Active when app.mail.provider is 'smtp' (case-insensitive) or unspecified.
 */
@Component("smtpEmailProvider")
@Conditional(OnSmtpCondition.class)
@RequiredArgsConstructor
public class SmtpEmailProvider implements EmailProvider {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SmtpEmailProvider.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:dnyaneshwaralgule2003@gmail.com}")
    private String defaultFromEmail;

    @Override
    public void send(EmailMessage message) {
        if (message == null) {
            throw new IllegalArgumentException("EmailMessage cannot be null");
        }

        if (message.isHtml()) {
            sendHtml(message);
        } else {
            sendPlainText(message);
        }
    }

    private void sendPlainText(EmailMessage message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(message.getTo());
        mailMessage.setSubject(message.getSubject());
        mailMessage.setText(message.getText());
        String from = (message.getFrom() != null && !message.getFrom().isBlank())
                ? message.getFrom()
                : defaultFromEmail;
        if (from != null && !from.isBlank()) {
            mailMessage.setFrom(from);
        }
        mailSender.send(mailMessage);
    }

    private void sendHtml(EmailMessage message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String from = (message.getFrom() != null && !message.getFrom().isBlank())
                    ? message.getFrom()
                    : defaultFromEmail;
            String senderName = (message.getSenderName() != null && !message.getSenderName().isBlank())
                    ? message.getSenderName()
                    : "SpeakMateAI";

            if (from != null && !from.isBlank()) {
                helper.setFrom(from, senderName);
            }

            helper.setTo(message.getTo());
            helper.setSubject(message.getSubject());
            String htmlContent = message.getHtmlContent() != null ? message.getHtmlContent() : message.getText();
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to construct or send HTML email for {}: {}", message.getTo(), e.getMessage(), e);
            throw new RuntimeException("Failed to construct or send HTML email: " + e.getMessage(), e);
        }
    }
}

