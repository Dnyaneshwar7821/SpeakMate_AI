package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolAdminSendInvitationResponse {

    private boolean success;
    private String message;
    private String email;
    private LocalDateTime invitationSentAt;
}
