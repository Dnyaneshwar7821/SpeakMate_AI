package com.rslsolution.speakmateai.service.email;

/**
 * Provider abstraction responsible strictly for email delivery transport.
 */
public interface EmailProvider {

    void send(EmailMessage message);
}
