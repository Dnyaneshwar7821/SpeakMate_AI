package com.rslsolution.speakmateai.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class TenantAuthController {

	private final UserService userService;

	public TenantAuthController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/school-admin/login")
	public AuthResponse loginSchoolAdmin(@Valid @RequestBody LoginRequest request) {
		return userService.loginSchoolAdmin(request);
	}

	@PostMapping("/teacher/login")
	public AuthResponse loginTeacher(@Valid @RequestBody LoginRequest request) {
		return userService.loginTeacher(request);
	}

	@PostMapping("/login")
	public AuthResponse loginUser(@Valid @RequestBody LoginRequest request) {
		return userService.loginUser(request);
	}

	@PostMapping("/student/login")
	public AuthResponse loginStudent(@Valid @RequestBody LoginRequest request) {
		return userService.loginStudent(request);
	}

	@PostMapping("/reset-password-with-temporary")
	public org.springframework.http.ResponseEntity<?> resetPasswordWithTemporary(@Valid @RequestBody com.rslsolution.speakmateai.dto.request.ResetWithTemporaryPasswordRequest request) {
		userService.resetPasswordWithTemporary(request);
		return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully."));
	}
}
