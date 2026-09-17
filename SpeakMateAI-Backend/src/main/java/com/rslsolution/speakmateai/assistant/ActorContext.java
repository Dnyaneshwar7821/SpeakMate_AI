package com.rslsolution.speakmateai.assistant;

import com.rslsolution.speakmateai.enums.Role;

/**
 * Immutable snapshot of the authenticated caller, resolved once per request by
 * {@link ActorResolver}. Contains the caller's own identity/scope ids plus the
 * few own-profile fields (display name, location, phone, join date) needed to
 * answer "my phone" / "my joined date" — never another user's data, never
 * passwords.
 */
public class ActorContext {

	private final String email;
	private final Role role;
	private final Long userId;
	private final Long schoolId;
	private final Long teacherId;
	private final Long studentId;
	private final Long adminId;
	private final String displayName;
	private final String location;
	private final String phone;
	private final String joinedAt;

	private ActorContext(Builder b) {
		this.email = b.email;
		this.role = b.role;
		this.userId = b.userId;
		this.schoolId = b.schoolId;
		this.teacherId = b.teacherId;
		this.studentId = b.studentId;
		this.adminId = b.adminId;
		this.displayName = b.displayName;
		this.location = b.location;
		this.phone = b.phone;
		this.joinedAt = b.joinedAt;
	}

	public static Builder builder() {
		return new Builder();
	}

	public String getEmail() { return email; }
	public Role getRole() { return role; }
	public Long getUserId() { return userId; }
	public Long getSchoolId() { return schoolId; }
	public Long getTeacherId() { return teacherId; }
	public Long getStudentId() { return studentId; }
	public Long getAdminId() { return adminId; }
	public String getDisplayName() { return displayName; }
	public String getLocation() { return location; }
	public String getPhone() { return phone; }
	public String getJoinedAt() { return joinedAt; }

	public static class Builder {
		private String email;
		private Role role;
		private Long userId;
		private Long schoolId;
		private Long teacherId;
		private Long studentId;
		private Long adminId;
		private String displayName;
		private String location;
		private String phone;
		private String joinedAt;

		public Builder email(String v) { this.email = v; return this; }
		public Builder role(Role v) { this.role = v; return this; }
		public Builder userId(Long v) { this.userId = v; return this; }
		public Builder schoolId(Long v) { this.schoolId = v; return this; }
		public Builder teacherId(Long v) { this.teacherId = v; return this; }
		public Builder studentId(Long v) { this.studentId = v; return this; }
		public Builder adminId(Long v) { this.adminId = v; return this; }
		public Builder displayName(String v) { this.displayName = v; return this; }
		public Builder location(String v) { this.location = v; return this; }
		public Builder phone(String v) { this.phone = v; return this; }
		public Builder joinedAt(String v) { this.joinedAt = v; return this; }

		public ActorContext build() {
			return new ActorContext(this);
		}
	}
}
