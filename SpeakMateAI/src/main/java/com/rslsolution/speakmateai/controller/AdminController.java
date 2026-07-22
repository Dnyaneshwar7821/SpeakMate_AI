package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.response.AdminDashboardResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;
import com.rslsolution.speakmateai.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final AdminService adminService;

	public AdminController(AdminService adminService) {
		this.adminService = adminService;
	}

	@GetMapping("/dashboard")
	public AdminDashboardResponse getDashboard() {

		return adminService.getDashboard();
	}

	@GetMapping("/users")
	public List<UserResponse> getAllUsers() {

		return adminService.getAllUsers();
	}

	@GetMapping("/users/{id}")
	public UserResponse getUserById(@PathVariable Long id) {

		return adminService.getUserById(id);
	}

	@PutMapping("/users/activate/{id}")
	public UserResponse activateUser(@PathVariable Long id) {

		return adminService.activateUser(id);
	}

	@PutMapping("/users/deactivate/{id}")
	public UserResponse deactivateUser(@PathVariable Long id) {

		return adminService.deactivateUser(id);
	}
}