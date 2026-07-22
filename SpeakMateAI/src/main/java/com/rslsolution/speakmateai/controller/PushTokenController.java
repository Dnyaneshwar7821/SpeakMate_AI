package com.rslsolution.speakmateai.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Endpoint used by the mobile app to register / update the Expo push token
 * for the currently authenticated user.
 *
 * Called on every app launch (after permissions are granted) so the token
 * stays fresh even when Expo rotates it.
 */
@RestController
@RequestMapping("/api/user")
public class PushTokenController {

    private final UserRepository userRepository;

    public PushTokenController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/push-token")
    public String updatePushToken(@Valid @RequestBody PushTokenRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setExpoPushToken(request.getToken());
        userRepository.save(user);
        return "Push token updated successfully.";
    }

    // ── Inner DTO ─────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PushTokenRequest {
        @NotBlank(message = "Token is required")
        private String token;
    }
}
