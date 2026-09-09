package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.rslsolution.speakmateai.enums.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @Pattern(regexp = "^$|^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String phone;
    
    private Role role;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public static AdminRegisterRequestBuilder builder() {
        return new AdminRegisterRequestBuilder();
    }

    public static class AdminRegisterRequestBuilder {
        private String fullName;
        private String email;
        private String password;
        private String phone;
        private Role role;

        public AdminRegisterRequestBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AdminRegisterRequestBuilder email(String email) { this.email = email; return this; }
        public AdminRegisterRequestBuilder password(String password) { this.password = password; return this; }
        public AdminRegisterRequestBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminRegisterRequestBuilder role(Role role) { this.role = role; return this; }

        public AdminRegisterRequest build() {
            AdminRegisterRequest req = new AdminRegisterRequest();
            req.setFullName(fullName);
            req.setEmail(email);
            req.setPassword(password);
            req.setPhone(phone);
            req.setRole(role);
            return req;
        }
    }
}
