package com.wohnswipe.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "swipes")
@Data
public class Swipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "listing_id")
    private Long listingId;

    private String direction; // LEFT, RIGHT

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // For simple fetching if needed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", insertable = false, updatable = false)
    private Listing listing;
}
