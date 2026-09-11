package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolRequest {
    @NotBlank(message = "School name is required")
    private String schoolName;

    private String address;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String contactPhone;

    private String adminFirstName;

    private String adminLastName;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid email format")
    private String adminEmail;

    private String verificationToken;

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail != null ? adminEmail.trim() : null;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken != null ? verificationToken.trim() : null;
    }
}
