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

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getHtmlContent() { return htmlContent; }
    public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }

    public boolean isHtml() {
        return html || (htmlContent != null && !htmlContent.isBlank());
    }
    public void setHtml(boolean html) { this.html = html; }

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

    public static EmailMessageBuilder builder() {
        return new EmailMessageBuilder();
    }

    public static class EmailMessageBuilder {
        private String to;
        private String from;
        private String senderName;
        private String subject;
        private String text;
        private String htmlContent;
        private boolean html = false;

        public EmailMessageBuilder to(String to) { this.to = to; return this; }
        public EmailMessageBuilder from(String from) { this.from = from; return this; }
        public EmailMessageBuilder senderName(String senderName) { this.senderName = senderName; return this; }
        public EmailMessageBuilder subject(String subject) { this.subject = subject; return this; }
        public EmailMessageBuilder text(String text) { this.text = text; return this; }
        public EmailMessageBuilder htmlContent(String htmlContent) { this.htmlContent = htmlContent; return this; }
        public EmailMessageBuilder html(boolean html) { this.html = html; return this; }

        public EmailMessage build() {
            EmailMessage msg = new EmailMessage();
            msg.setTo(to);
            msg.setFrom(from);
            msg.setSenderName(senderName);
            msg.setSubject(subject);
            msg.setText(text);
            msg.setHtmlContent(htmlContent);
            msg.setHtml(html);
            return msg;
        }
    }
}
