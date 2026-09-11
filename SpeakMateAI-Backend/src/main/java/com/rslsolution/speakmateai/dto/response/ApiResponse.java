package com.rslsolution.speakmateai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

	private boolean success;
	private String message;
	private T data;

	public boolean isSuccess() { return success; }
	public void setSuccess(boolean success) { this.success = success; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public T getData() { return data; }
	public void setData(T data) { this.data = data; }

	public static <T> ApiResponse<T> success(String message, T data) {
		ApiResponse<T> resp = new ApiResponse<>();
		resp.setSuccess(true);
		resp.setMessage(message);
		resp.setData(data);
		return resp;
	}

	public static <T> ApiResponse<T> success(String message) {
		return success(message, null);
	}

	public static <T> ApiResponse<T> error(String message) {
		ApiResponse<T> resp = new ApiResponse<>();
		resp.setSuccess(false);
		resp.setMessage(message);
		return resp;
	}
}
