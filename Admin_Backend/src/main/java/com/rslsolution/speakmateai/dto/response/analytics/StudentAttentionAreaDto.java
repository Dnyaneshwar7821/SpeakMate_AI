package com.rslsolution.speakmateai.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttentionAreaDto {
    private String area;
    private String scoreOrValue;
    private String reason;
}
