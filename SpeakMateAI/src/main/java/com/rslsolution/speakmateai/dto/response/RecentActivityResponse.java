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
public class RecentActivityResponse {

	private String id;

	private String type;

	private String icon;

	private String title;

	private LocalDateTime time;

	private Integer xp;

}
