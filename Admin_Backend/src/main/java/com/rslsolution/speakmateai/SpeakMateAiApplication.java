package com.rslsolution.speakmateai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpeakMateAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpeakMateAiApplication.class, args);
		System.err.println("App Started..");
	}

}
