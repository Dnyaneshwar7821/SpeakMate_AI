package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolResponse {
    private Long id;
    private String name;
    private String schoolCode;
    private String address;
    private String contactPhone;
    private boolean active;
    private LocalDateTime createdAt;
    
    // Details of the admin created for this school
    private Long adminId;
    private String adminEmail;
    private String adminName;
    private String adminPhone;

    // Academic Structure
    private Integer standardsCount;
    private Integer totalDivisions;
    private Integer divisionCount;
    private List<StandardDivisionResponse> academicStructure;
}
