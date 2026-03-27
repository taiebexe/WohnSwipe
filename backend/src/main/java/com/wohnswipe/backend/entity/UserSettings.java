package com.wohnswipe.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Data
public class UserSettings {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "auto_apply_enabled")
    private Boolean autoApplyEnabled = false;

    @Column(name = "daily_apply_limit")
    private Integer dailyApplyLimit = 10;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
