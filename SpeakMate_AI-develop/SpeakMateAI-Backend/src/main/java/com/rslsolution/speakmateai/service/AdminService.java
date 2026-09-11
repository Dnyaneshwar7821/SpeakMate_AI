package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.response.AdminDashboardResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;

public interface AdminService {

	// Dashboard
	AdminDashboardResponse getDashboard();

	// User Management
	List<UserResponse> getAllUsers();

	UserResponse getUserById(Long id);

	UserResponse activateUser(Long id);

	UserResponse deactivateUser(Long id);

}