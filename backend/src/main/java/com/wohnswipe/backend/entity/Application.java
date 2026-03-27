package com.wohnswipe.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "listing_id")
    private Long listingId;

    @Column(name = "generated_message_id")
    private Long generatedMessageId;

    @Column(nullable = false)
    private String method; // EMAIL, CLIPBOARD

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SENT, FAILED

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
