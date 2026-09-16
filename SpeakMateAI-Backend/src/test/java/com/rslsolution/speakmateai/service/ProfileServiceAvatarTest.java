package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rslsolution.speakmateai.dto.request.AvatarRequest;
import com.rslsolution.speakmateai.dto.request.ProfileRequest;
import com.rslsolution.speakmateai.dto.response.ProfileResponse;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.ProfileServiceImpl;

public class ProfileServiceAvatarTest {

    private UserRepository userRepository;
    private ProgressRepository progressRepository;
    private ProfileServiceImpl profileService;
    private User testUser;
    private final String testEmail = "avatar.tester@example.com";

    @BeforeEach
    public void setup() {
        userRepository = mock(UserRepository.class);
        progressRepository = mock(ProgressRepository.class);
        profileService = new ProfileServiceImpl(userRepository, progressRepository);

        testUser = User.builder()
                .id(1L)
                .firstName("Alex")
                .lastName("Taylor")
                .email(testEmail)
                .role(Role.USER)
                .active(true)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(testEmail);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Valid ~20 KB base64 avatar within 64 KB limit updates successfully")
    public void testValidBase64AvatarUpdatesSuccessfully() {
        byte[] dummyImageBytes = new byte[15 * 1024]; // 15 KB binary
        for (int i = 0; i < dummyImageBytes.length; i++) {
            dummyImageBytes[i] = (byte) (i % 128);
        }
        String base64Encoded = Base64.getEncoder().encodeToString(dummyImageBytes);
        String dataUri = "data:image/jpeg;base64," + base64Encoded;

        assertTrue(dataUri.length() < ProfileServiceImpl.MAX_AVATAR_LENGTH, "Payload should be under 64 KB");

        AvatarRequest request = new AvatarRequest();
        request.setAvatar(dataUri);

        ProfileResponse response = profileService.updateAvatar(request);

        assertNotNull(response);
        assertEquals(dataUri, response.getAvatar());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Oversized avatar (> 64 KB) throws IllegalArgumentException with specific message")
    public void testOversizedAvatarThrowsException() {
        byte[] largeBytes = new byte[55 * 1024]; // ~73 KB Base64
        String largeBase64 = Base64.getEncoder().encodeToString(largeBytes);
        String oversizedDataUri = "data:image/jpeg;base64," + largeBase64;

        assertTrue(oversizedDataUri.length() > ProfileServiceImpl.MAX_AVATAR_LENGTH, "Payload must exceed 64 KB");

        AvatarRequest request = new AvatarRequest();
        request.setAvatar(oversizedDataUri);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateAvatar(request);
        });

        assertTrue(ex.getMessage().contains("64 KB"), "Error message must mention 64 KB limit");
    }

    @Test
    @DisplayName("Malformed data URI missing comma separator throws IllegalArgumentException")
    public void testMalformedDataUriThrowsException() {
        AvatarRequest request = new AvatarRequest();
        request.setAvatar("data:image/jpeg;base64_missing_separator");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateAvatar(request);
        });

        assertTrue(ex.getMessage().contains("Missing base64 data separator"));
    }

    @Test
    @DisplayName("Unsupported MIME type (e.g. image/gif) throws IllegalArgumentException")
    public void testUnsupportedMimeTypeThrowsException() {
        AvatarRequest request = new AvatarRequest();
        request.setAvatar("data:image/gif;base64," + Base64.getEncoder().encodeToString("dummy".getBytes()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateAvatar(request);
        });

        assertTrue(ex.getMessage().contains("Only JPEG, PNG, or WebP"));
    }

    @Test
    @DisplayName("Corrupt base64 characters throws IllegalArgumentException")
    public void testCorruptBase64ThrowsException() {
        AvatarRequest request = new AvatarRequest();
        request.setAvatar("data:image/jpeg;base64,???not-valid-base64???");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            profileService.updateAvatar(request);
        });

        assertTrue(ex.getMessage().contains("Invalid base64 encoding"));
    }

    @Test
    @DisplayName("Preset avatar ID or emoji is preserved without error")
    public void testPresetAvatarSucceeds() {
        AvatarRequest request = new AvatarRequest();
        request.setAvatar("avatar_model_chitose");

        ProfileResponse response = profileService.updateAvatar(request);

        assertNotNull(response);
        assertEquals("avatar_model_chitose", response.getAvatar());
    }

    @Test
    @DisplayName("Null or empty avatar in ProfileRequest leaves avatar untouched")
    public void testNullOrEmptyAvatarAllowed() {
        testUser.setAvatar("existing_avatar");

        ProfileRequest profileReq = new ProfileRequest();
        profileReq.setFirstName("Alex");
        profileReq.setLastName("Taylor");
        profileReq.setAvatar(null);

        ProfileResponse response = profileService.updateProfile(profileReq);

        assertNotNull(response);
        assertEquals("existing_avatar", response.getAvatar());
    }
}
