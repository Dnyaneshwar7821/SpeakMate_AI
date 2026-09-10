package com.rslsolution.speakmateai.dto;

import com.rslsolution.speakmateai.dto.request.SchoolTeacherRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class SchoolTeacherRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    public static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidation_WhenPasswordIsNull_ShouldPass() {
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .password(null)
                .phone("9876543210")
                .build();

        Set<ConstraintViolation<SchoolTeacherRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Should have no violations when password is null during update");
    }

    @Test
    void testValidation_WhenPasswordIsEmptyString_ShouldPass() {
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .password("")
                .phone("9876543210")
                .build();

        Set<ConstraintViolation<SchoolTeacherRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Should have no violations when password is empty string during update");
    }

    @Test
    void testValidation_WhenPasswordIsProvidedAndValid_ShouldPass() {
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .password("StrongPass1@")
                .phone("9876543210")
                .build();

        Set<ConstraintViolation<SchoolTeacherRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Should have no violations when valid password is provided");
    }

    @Test
    void testValidation_WhenPasswordIsWeak_ShouldFail() {
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .password("simple")
                .phone("9876543210")
                .build();

        Set<ConstraintViolation<SchoolTeacherRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Should fail validation when weak password is provided");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void testValidation_WhenRequiredFieldsMissing_ShouldFail() {
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
                .firstName("")
                .lastName("")
                .email("invalid-email")
                .build();

        Set<ConstraintViolation<SchoolTeacherRequest>> violations = validator.validate(request);
        assertEquals(3, violations.size());
    }
}
