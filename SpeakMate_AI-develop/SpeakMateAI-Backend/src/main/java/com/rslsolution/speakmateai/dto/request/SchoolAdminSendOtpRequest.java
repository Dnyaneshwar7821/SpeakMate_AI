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
public class SchoolAdminSendOtpRequest {

    @NotBlank(message = "School admin email is required")
    @Email(message = "Invalid email format")
    private String email;

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }
}
