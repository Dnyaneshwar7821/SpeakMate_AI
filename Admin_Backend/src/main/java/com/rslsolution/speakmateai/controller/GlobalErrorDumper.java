package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.io.PrintWriter;
import java.io.StringWriter;

@ControllerAdvice
public class GlobalErrorDumper {
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleException(Throwable e) {
        try {
            PrintWriter pw = new PrintWriter(new java.io.FileWriter("D:/IntegrationOfSpeakMate/global_error_dump_2.txt", true));
            pw.println("----- EXCEPTION CAUGHT -----");
            e.printStackTrace(pw);
            pw.close();
        } catch (Exception ex) {}
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
    }
}
