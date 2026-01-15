package com.wohnswipe.backend.dto;

import lombok.Data;

@Data
public class SwipeResponse {
    private boolean match;
    private String message; // Null if no match/Left swipe
    
    public SwipeResponse(boolean match, String message) {
        this.match = match;
        this.message = message;
    }
}
