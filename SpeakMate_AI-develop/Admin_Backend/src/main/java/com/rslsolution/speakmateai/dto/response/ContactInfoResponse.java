package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInfoResponse {
	private String phone;
	private String alternatePhone;
	private String location;
	private String address;
	private String city;
	private String state;
	private String country;
}
