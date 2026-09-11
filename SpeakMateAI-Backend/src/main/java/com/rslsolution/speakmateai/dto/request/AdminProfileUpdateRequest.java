package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^$|^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String phone;

    private String department;
    
    private String designation;
    
    private String location;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public static AdminProfileUpdateRequestBuilder builder() {
        return new AdminProfileUpdateRequestBuilder();
    }

    public static class AdminProfileUpdateRequestBuilder {
        private String fullName;
        private String phone;
        private String department;
        private String designation;
        private String location;

        public AdminProfileUpdateRequestBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AdminProfileUpdateRequestBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminProfileUpdateRequestBuilder department(String department) { this.department = department; return this; }
        public AdminProfileUpdateRequestBuilder designation(String designation) { this.designation = designation; return this; }
        public AdminProfileUpdateRequestBuilder location(String location) { this.location = location; return this; }

        public AdminProfileUpdateRequest build() {
            AdminProfileUpdateRequest r = new AdminProfileUpdateRequest();
            r.fullName = fullName;
            r.phone = phone;
            r.department = department;
            r.designation = designation;
            r.location = location;
            return r;
        }
    }
}
