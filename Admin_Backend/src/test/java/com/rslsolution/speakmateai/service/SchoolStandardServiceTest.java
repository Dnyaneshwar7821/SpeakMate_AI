package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rslsolution.speakmateai.dto.response.StandardDivisionResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.SchoolStandardServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolStandardServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private SchoolRepository schoolRepository;
    @Mock
    private SchoolStandardRepository schoolStandardRepository;
    @Mock
    private StandardDivisionRepository standardDivisionRepository;
    @Mock
    private TeacherStandardDivisionRepository teacherStandardDivisionRepository;

    @InjectMocks
    private SchoolStandardServiceImpl schoolStandardService;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("admin@school.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testConfigureStandards_Success() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(schoolRepository.findById(1L)).thenReturn(Optional.of(School.builder().id(1L).build()));
        when(schoolStandardRepository.findBySchoolId(1L)).thenReturn(Collections.emptyList());

        SchoolStandard savedStd = SchoolStandard.builder().id(1L).standard("5").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(savedStd));
        
        List<StandardDivisionResponse> request = Arrays.asList(
            StandardDivisionResponse.builder().standard("5").divisions(Arrays.asList("A", "B")).build()
        );

        List<StandardDivisionResponse> response = schoolStandardService.configureStandards(1L, request);
        assertNotNull(response);
    }

    @Test
    void testConfigureStandards_OtherSchool_ThrowsException() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        List<StandardDivisionResponse> request = Collections.emptyList();

        assertThrows(AccessDeniedException.class, () -> {
            schoolStandardService.configureStandards(2L, request);
        });
    }
}
