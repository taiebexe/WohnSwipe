package com.wohnswipe.backend.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private Long id;
    private String email;

    public JwtResponse(String token, Long id, String email) {
        this.token = token;
        this.id = id;
        this.email = email;
    }
}
