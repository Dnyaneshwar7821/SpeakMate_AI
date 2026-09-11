package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.AdminStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileResponse {
    
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String location;
    private String role;
    private AdminStatus status;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public AdminStatus getStatus() { return status; }
    public void setStatus(AdminStatus status) { this.status = status; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static AdminProfileResponseBuilder builder() {
        return new AdminProfileResponseBuilder();
    }

    public static class AdminProfileResponseBuilder {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String department;
        private String designation;
        private String location;
        private String role;
        private AdminStatus status;
        private LocalDateTime lastLogin;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public AdminProfileResponseBuilder id(Long id) { this.id = id; return this; }
        public AdminProfileResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AdminProfileResponseBuilder email(String email) { this.email = email; return this; }
        public AdminProfileResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminProfileResponseBuilder department(String department) { this.department = department; return this; }
        public AdminProfileResponseBuilder designation(String designation) { this.designation = designation; return this; }
        public AdminProfileResponseBuilder location(String location) { this.location = location; return this; }
        public AdminProfileResponseBuilder role(String role) { this.role = role; return this; }
        public AdminProfileResponseBuilder status(AdminStatus status) { this.status = status; return this; }
        public AdminProfileResponseBuilder lastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; return this; }
        public AdminProfileResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AdminProfileResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public AdminProfileResponse build() {
            AdminProfileResponse r = new AdminProfileResponse();
            r.id = id;
            r.fullName = fullName;
            r.email = email;
            r.phone = phone;
            r.department = department;
            r.designation = designation;
            r.location = location;
            r.role = role;
            r.status = status;
            r.lastLogin = lastLogin;
            r.createdAt = createdAt;
            r.updatedAt = updatedAt;
            return r;
        }
    }
}
