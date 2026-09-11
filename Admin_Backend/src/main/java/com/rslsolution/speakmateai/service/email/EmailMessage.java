package com.rslsolution.speakmateai.service.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing an email message for provider transport.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessage {

    private String to;
    private String from;
    private String senderName;
    private String subject;
    private String text;
    private String htmlContent;

    @Builder.Default
    private boolean html = false;

    public EmailMessage(String to, String subject, String text) {
        this.to = to;
        this.subject = subject;
        this.text = text;
        this.html = false;
    }

    public EmailMessage(String to, String subject, String content, boolean html) {
        this.to = to;
        this.subject = subject;
        if (html) {
            this.htmlContent = content;
            this.text = content;
            this.html = true;
        } else {
            this.text = content;
            this.html = false;
        }
    }

    public String getRecipient() {
        return to;
    }

    public void setRecipient(String recipient) {
        this.to = recipient;
    }

    public String getBody() {
        return text;
    }

    public void setBody(String body) {
        this.text = body;
    }

    public boolean isHtml() {
        return html || (htmlContent != null && !htmlContent.isBlank());
    }

    public static EmailMessage plainText(String to, String subject, String text) {
        return EmailMessage.builder()
                .to(to)
                .subject(subject)
                .text(text)
                .html(false)
                .build();
    }

    public static EmailMessage html(String to, String subject, String htmlContent) {
        return EmailMessage.builder()
                .to(to)
                .subject(subject)
                .htmlContent(htmlContent)
                .text(htmlContent)
                .html(true)
                .build();
    }

    public static EmailMessage html(String to, String subject, String htmlContent, String senderName) {
        return EmailMessage.builder()
                .to(to)
                .subject(subject)
                .htmlContent(htmlContent)
                .text(htmlContent)
                .senderName(senderName)
                .html(true)
                .build();
    }
}
