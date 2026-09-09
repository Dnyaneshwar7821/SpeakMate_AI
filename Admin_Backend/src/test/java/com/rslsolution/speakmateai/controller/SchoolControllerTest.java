package com.rslsolution.speakmateai.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Method;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import com.rslsolution.speakmateai.dto.request.SchoolRequest;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;
import com.rslsolution.speakmateai.service.SchoolService;

@ExtendWith(MockitoExtension.class)
public class SchoolControllerTest {

    @Mock
    private SchoolService schoolService;

    private SchoolController schoolController;

    @BeforeEach
    public void setUp() {
        schoolController = new SchoolController(schoolService);
    }

    @Test
    public void testCreateSchool_DelegatesToService() {
        SchoolRequest request = new SchoolRequest();
        request.setSchoolName("Test School");
        request.setVerificationToken("token-123");

        SchoolResponse responseDto = SchoolResponse.builder()
                .name("Test School")
                .build();

        when(schoolService.createSchool(request)).thenReturn(responseDto);

        ResponseEntity<SchoolResponse> response = schoolController.createSchool(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test School", response.getBody().getName());
        verify(schoolService).createSchool(request);
    }

    @Test
    public void testCreateSchool_HasSuperAdminPreAuthorize() throws NoSuchMethodException {
        Method createSchoolMethod = SchoolController.class.getMethod("createSchool", SchoolRequest.class);
        PreAuthorize preAuthorize = createSchoolMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuthorize, "createSchool must be protected with @PreAuthorize");
        assertEquals("hasRole('SUPER_ADMIN')", preAuthorize.value(), "createSchool must require SUPER_ADMIN role");
    }

    @Test
    public void testSendInvitation_DelegatesToService() {
        com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest request =
                new com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest("admin@example.com", "token-123");

        com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse responseDto =
                com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse.builder()
                        .success(true)
                        .message("Invitation sent")
                        .email("admin@example.com")
                        .build();

        when(schoolService.sendInvitation(request)).thenReturn(responseDto);

        ResponseEntity<com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse> response =
                schoolController.sendInvitation(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("admin@example.com", response.getBody().getEmail());
        verify(schoolService).sendInvitation(request);
    }

    @Test
    public void testSendInvitation_HasSuperAdminPreAuthorize() throws NoSuchMethodException {
        Method sendInvitationMethod = SchoolController.class.getMethod("sendInvitation",
                com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest.class);
        PreAuthorize preAuthorize = sendInvitationMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuthorize, "sendInvitation must be protected with @PreAuthorize");
        assertEquals("hasRole('SUPER_ADMIN')", preAuthorize.value(), "sendInvitation must require SUPER_ADMIN role");
    }
}
