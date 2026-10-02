package com.rslsolution.speakmateai.dto.response;

import com.rslsolution.speakmateai.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolAdminHistoryResponse {
    private Long id;
    private Long schoolId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private Status status;
    private boolean active;
    private boolean currentAdmin;
    private boolean welcomeCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
