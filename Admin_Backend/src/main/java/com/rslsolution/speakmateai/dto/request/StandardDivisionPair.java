package com.rslsolution.speakmateai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandardDivisionPair {

    @NotBlank(message = "Standard is required")
    private String standard;

    @NotBlank(message = "Division is required")
    private String division;
}
