package com.wohnswipe.backend.dto;

import lombok.Data;

@Data
public class SwipeResponse {
    private boolean match;
    private String message;
    private String applicationStatus; // null, "SENT", "PENDING", "FAILED"
    private Long applicationId;

    public SwipeResponse(boolean match, String message) {
        this.match = match;
        this.message = message;
    }

    public SwipeResponse(boolean match, String message, String applicationStatus, Long applicationId) {
        this.match = match;
        this.message = message;
        this.applicationStatus = applicationStatus;
        this.applicationId = applicationId;
    }
}
