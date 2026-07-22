package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.DeleteAccountRequest;
import com.rslsolution.speakmateai.dto.request.ForgotPasswordRequest;
import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.request.RegisterRequest;
import com.rslsolution.speakmateai.dto.request.ResetPasswordRequest;
import com.rslsolution.speakmateai.dto.request.SendDeleteAccountOtpRequest;
import com.rslsolution.speakmateai.dto.request.SendRegistrationOtpRequest;
import com.rslsolution.speakmateai.dto.request.VerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;
import com.rslsolution.speakmateai.dto.response.VerifyOtpResponse;
import com.rslsolution.speakmateai.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

	@Autowired
	private UserService userService;

	@PostMapping("/send-registration-otp")
	public String sendRegistrationOtp(@Valid @RequestBody SendRegistrationOtpRequest request) {
		userService.sendRegistrationOtp(request);
		return "Registration OTP has been sent to your email address.";
	}

	@PostMapping("/send-delete-account-otp")
	public String sendDeleteAccountOtp(@Valid @RequestBody SendDeleteAccountOtpRequest request) {
		userService.sendDeleteAccountOtp(request);
		return "Account deletion OTP verification code has been sent to your email address.";
	}

	@PostMapping("/delete-account")
	public String deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
		userService.deleteAccountWithOtp(request);
		return "Account deleted successfully.";
	}

	@PostMapping("/register")
	public UserResponse register(@Valid @RequestBody RegisterRequest request) {
		return userService.register(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return userService.login(request);
	}

	@PostMapping("/forgot-password")
	public String forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		userService.forgotPassword(request);
		return "An OTP code has been sent to your email address.";
	}

	@PostMapping("/verify-otp")
	public VerifyOtpResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
		return userService.verifyOtp(request);
	}

	@PostMapping("/reset-password")
	public String resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		userService.resetPassword(request);
		return "Password reset successfully.";
	}

	private static String lastRegisteredExpoUrl = null;

	@PostMapping("/register-expo-url")
	public void registerExpoUrl(@RequestBody java.util.Map<String, String> payload) {
		String url = payload.get("url");
		if (url != null) {
			if (url.endsWith("/")) {
				url = url.substring(0, url.length() - 1);
			}
			if (url.endsWith("/--")) {
				url = url.substring(0, url.length() - 3);
			}
			lastRegisteredExpoUrl = url;
			System.out.println("[Expo URL Registered] Active developer Expo URL: " + lastRegisteredExpoUrl);
		}
	}

	@GetMapping(value = "/reset-redirect", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
	public String resetRedirect(@org.springframework.web.bind.annotation.RequestParam String token, jakarta.servlet.http.HttpServletRequest request) {
		String host = request.getHeader("Host");
		if (host == null || host.isEmpty()) {
			host = "localhost:9091";
		}
		if (host.endsWith("/")) {
			host = host.substring(0, host.length() - 1);
		}
		String ipAddress = host;
		if (ipAddress.contains(":")) {
			ipAddress = ipAddress.split(":")[0];
		}

		String expoUrlToUse = lastRegisteredExpoUrl;
		if (expoUrlToUse == null) {
			expoUrlToUse = "exp://" + ipAddress + ":8081";
		}

		return String.format(
			"<!DOCTYPE html>\n" +
			"<html>\n" +
			"<head>\n" +
			"    <title>Opening SpeakMateAI...</title>\n" +
			"    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
			"    <style>\n" +
			"        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F172A; color: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }\n" +
			"        .card { background-color: #1E293B; border-radius: 24px; padding: 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); border: 1px solid #334155; max-width: 440px; width: 100%%; box-sizing: border-box; }\n" +
			"        .logo { font-size: 28px; font-weight: 900; color: #6366F1; margin-bottom: 20px; letter-spacing: -0.5px; }\n" +
			"        h1 { font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #F8FAFC; }\n" +
			"        p { font-size: 14px; color: #94A3B8; margin-bottom: 24px; line-height: 22px; }\n" +
			"        .btn { display: block; background-color: #6366F1; color: #FFFFFF !important; padding: 14px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: bold; margin-bottom: 12px; transition: background-color 0.2s; }\n" +
			"        .btn:hover { background-color: #4F46E5; }\n" +
			"        .btn-expo { background-color: #3B82F6; }\n" +
			"        .btn-expo:hover { background-color: #2563EB; }\n" +
			"        .footer { font-size: 12px; color: #64748B; margin-top: 18px; line-height: 18px; }\n" +
			"    </style>\n" +
			"</head>\n" +
			"<body>\n" +
			"    <div class=\"card\">\n" +
			"        <div class=\"logo\">SpeakMateAI</div>\n" +
			"        <h1>Reset Password</h1>\n" +
			"        <p>Choose an option below to open the password reset page in your app.</p>\n" +
			"        \n" +
			"        <a id=\"btn-expo\" href=\"%s/--/auth/reset-password?token=%s\" class=\"btn btn-expo\">Open in Expo Go</a>\n" +
			"        <a id=\"btn-app\" href=\"speakmateai://auth/reset-password?token=%s\" class=\"btn\">Open in App (Standalone)</a>\n" +
			"        \n" +
			"        <div style=\"margin-top: 20px; border-top: 1px solid #334155; padding-top: 20px; text-align: left;\">\n" +
			"            <label style=\"font-size: 12px; color: #94A3B8; font-weight: bold; display: block; margin-bottom: 8px;\">Testing with Expo Tunnel?</label>\n" +
			"            <div style=\"display: flex; gap: 8px;\">\n" +
			"                <input id=\"tunnel-input\" type=\"text\" placeholder=\"exp://xxxx.exp.direct\" style=\"flex: 1; background-color: #0F172A; border: 1px solid #475569; border-radius: 8px; color: #FFFFFF; padding: 8px 12px; font-size: 13px;\" />\n" +
			"                <button onclick=\"openTunnelLink()\" style=\"background-color: #3B82F6; color: #FFFFFF; border: none; border-radius: 8px; padding: 8px 14px; font-weight: bold; cursor: pointer; font-size: 13px;\">Open</button>\n" +
			"            </div>\n" +
			"        </div>\n" +
			"        \n" +
			"        <div class=\"footer\">If the app doesn't open automatically, please select an option above.</div>\n" +
			"    </div>\n" +
			"    \n" +
			"    <script>\n" +
			"        const token = \"%s\";\n" +
			"        const activeExpoUrl = \"%s\";\n" +
			"        \n" +
			"        // Auto-redirect attempts\n" +
			"        setTimeout(function() { \n" +
			"            window.location.href = activeExpoUrl + \"/--/auth/reset-password?token=\" + token;\n" +
			"        }, 300);\n" +
			"        setTimeout(function() { \n" +
			"            window.location.href = \"speakmateai://auth/reset-password?token=\" + token; \n" +
			"        }, 1500);\n" +
			"\n" +
			"        function openTunnelLink() {\n" +
			"            let base = document.getElementById('tunnel-input').value.trim();\n" +
			"            if (!base) {\n" +
			"                alert('Please enter your Expo URL (starts with exp://)');\n" +
			"                return;\n" +
			"            }\n" +
			"            base = base.replace(/\\/$/, '');\n" +
			"            if (base.includes('/--')) {\n" +
			"                base = base.split('/--')[0];\n" +
			"            }\n" +
			"            window.location.href = base + '/--/auth/reset-password?token=' + token;\n" +
			"        }\n" +
			"    </script>\n" +
			"</body>\n" +
			"</html>", expoUrlToUse, token, token, token, expoUrlToUse
		);
	}

	@GetMapping("/me")
	public UserResponse me() {
		return userService.getCurrentUser();
	}

	@GetMapping("/get-all-users")
	public List<UserResponse> getAllUsers() {
		return userService.getAllUsers();
	}

	@GetMapping("/get-user-by-id/{id}")
	public UserResponse getUserById(@PathVariable Long id) {
		return userService.getUserById(id);
	}

	@PutMapping("/update-user/{id}")
	public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody RegisterRequest request) {
		return userService.updateUser(id, request);
	}

	@DeleteMapping("delete-user/{id}")
	public String deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		return "User deleted successfully.";
	}
}
