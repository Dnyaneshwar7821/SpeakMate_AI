package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolAdminSendInvitationRequest {

    @NotBlank(message = "School admin email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Verification token is required")
    private String verificationToken;

    private String schoolName;
    private String address;
    private String adminFirstName;
    private String adminLastName;

    public SchoolAdminSendInvitationRequest(String email, String verificationToken) {
        this.email = email != null ? email.trim() : null;
        this.verificationToken = verificationToken != null ? verificationToken.trim() : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken != null ? verificationToken.trim() : null;
    }
}
