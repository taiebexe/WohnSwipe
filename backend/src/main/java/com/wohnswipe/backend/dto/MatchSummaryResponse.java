package com.wohnswipe.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MatchSummaryResponse {
    private Long listingId;
    private String title;
    private String district;
    private String address;
    private BigDecimal rent;
    private Double rooms;
    private Double sizeSqm;
    private String description;
    private LocalDate availableFrom;
    private String landlordName;
    private String contactEmail;
    private String imageUrl;
    private String message;
    private LocalDateTime matchedAt;

    public MatchSummaryResponse(
            Long listingId,
            String title,
            String district,
            String address,
            BigDecimal rent,
            Double rooms,
            Double sizeSqm,
            String description,
            LocalDate availableFrom,
            String landlordName,
            String contactEmail,
            String imageUrl,
            String message,
            LocalDateTime matchedAt
    ) {
        this.listingId = listingId;
        this.title = title;
        this.district = district;
        this.address = address;
        this.rent = rent;
        this.rooms = rooms;
        this.sizeSqm = sizeSqm;
        this.description = description;
        this.availableFrom = availableFrom;
        this.landlordName = landlordName;
        this.contactEmail = contactEmail;
        this.imageUrl = imageUrl;
        this.message = message;
        this.matchedAt = matchedAt;
    }
}
