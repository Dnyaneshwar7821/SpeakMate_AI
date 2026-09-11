package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.NotificationType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = true)
	private User user;

	@Column(name = "recipient_email")
	private String recipientEmail;

	@Enumerated(EnumType.STRING)
	@Column(name = "notification_type")
	private NotificationType notificationType;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String message;

	private Boolean isRead;

	@Column(name = "entity_id")
	private Long entityId;

	@Column(name = "entity_type")
	private String entityType;

	@Column(name = "school_id")
	private Long schoolId;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		if (isRead == null) {
			isRead = false;
		}
		if (notificationType == null) {
			notificationType = NotificationType.SYSTEM_EVENT;
		}
	}

	public Student getStudent() {
		return (user instanceof Student) ? (Student) user : null;
	}

	public void setStudent(Student student) {
		this.user = student;
	}
}