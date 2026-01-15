package com.wohnswipe.backend.dto;

import lombok.Data;

@Data
public class SwipeRequest {
    private Long listingId;
    private String direction; // LEFT or RIGHT
}
