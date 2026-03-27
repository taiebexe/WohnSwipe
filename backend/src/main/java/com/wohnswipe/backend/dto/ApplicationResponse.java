package com.wohnswipe.backend.dto;

import com.wohnswipe.backend.entity.Application;
import com.wohnswipe.backend.entity.Listing;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private String listingDistrict;
    private java.math.BigDecimal listingRent;
    private String listingImageUrl;
    private String listingSourceUrl;
    private String method;
    private String status;
    private String message;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private String errorMessage;

    public ApplicationResponse(Application app, Listing listing, String message) {
        this.id = app.getId();
        this.listingId = app.getListingId();
        this.method = app.getMethod();
        this.status = app.getStatus();
        this.message = message;
        this.sentAt = app.getSentAt();
        this.createdAt = app.getCreatedAt();
        this.errorMessage = app.getErrorMessage();

        if (listing != null) {
            this.listingTitle = listing.getTitle();
            this.listingDistrict = listing.getDistrict();
            this.listingRent = listing.getRent();
            this.listingImageUrl = listing.getImageUrl();
            this.listingSourceUrl = listing.getSourceUrl();
        }
    }
}
