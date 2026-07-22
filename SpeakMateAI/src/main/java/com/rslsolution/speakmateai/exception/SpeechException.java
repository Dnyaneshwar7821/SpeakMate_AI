package com.rslsolution.speakmateai.exception;

public class SpeechException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public SpeechException(String message) {
		super(message);
	}

	public SpeechException(String message, Throwable cause) {
		super(message, cause);
	}
}