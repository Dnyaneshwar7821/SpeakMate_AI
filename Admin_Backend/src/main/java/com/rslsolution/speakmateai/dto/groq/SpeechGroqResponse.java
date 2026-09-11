package com.rslsolution.speakmateai.dto.groq;

import lombok.Data;

@Data
public class SpeechGroqResponse {

    private String text;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

}