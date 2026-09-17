package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platform_integrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformIntegration {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "integration_id", nullable = false, unique = true, length = 64)
	private String integrationId;

	@Column(nullable = false, length = 128)
	private String name;

	@Column(nullable = false, length = 64)
	private String category;

	@Column(length = 64)
	private String badge;

	@Column(nullable = false, length = 32)
	@Builder.Default
	private String status = "disconnected";

	@Column(name = "environment_mode", length = 32)
	@Builder.Default
	private String environmentMode = "live";

	@Column(name = "config_data", columnDefinition = "TEXT")
	private String configData;

	@Column(name = "last_sync_message", length = 255)
	private String lastSyncMessage;

	@Column(name = "last_tested_at")
	private LocalDateTime lastTestedAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}
}
