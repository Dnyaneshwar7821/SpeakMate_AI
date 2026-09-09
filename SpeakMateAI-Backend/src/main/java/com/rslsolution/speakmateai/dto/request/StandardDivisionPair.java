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

    public String getStandard() { return standard; }
    public void setStandard(String standard) { this.standard = standard; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public static StandardDivisionPairBuilder builder() {
        return new StandardDivisionPairBuilder();
    }

    public static class StandardDivisionPairBuilder {
        private String standard;
        private String division;

        public StandardDivisionPairBuilder standard(String standard) { this.standard = standard; return this; }
        public StandardDivisionPairBuilder division(String division) { this.division = division; return this; }

        public StandardDivisionPair build() {
            StandardDivisionPair p = new StandardDivisionPair();
            p.setStandard(standard);
            p.setDivision(division);
            return p;
        }
    }
}
