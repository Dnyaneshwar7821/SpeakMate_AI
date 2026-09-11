package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$", message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character")
    private String newPassword;
    
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public static ChangePasswordRequestBuilder builder() {
        return new ChangePasswordRequestBuilder();
    }

    public static class ChangePasswordRequestBuilder {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;

        public ChangePasswordRequestBuilder currentPassword(String currentPassword) { this.currentPassword = currentPassword; return this; }
        public ChangePasswordRequestBuilder newPassword(String newPassword) { this.newPassword = newPassword; return this; }
        public ChangePasswordRequestBuilder confirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; return this; }

        public ChangePasswordRequest build() {
            ChangePasswordRequest r = new ChangePasswordRequest();
            r.currentPassword = currentPassword;
            r.newPassword = newPassword;
            r.confirmPassword = confirmPassword;
            return r;
        }
    }
}
