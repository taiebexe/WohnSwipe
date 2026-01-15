package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.dto.JwtResponse;
import com.wohnswipe.backend.dto.LoginRequest;
import com.wohnswipe.backend.dto.RegisterRequest;
import com.wohnswipe.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwt = authService.tbourbiaLogin(loginRequest);
        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        authService.register(signUpRequest);
        return ResponseEntity.ok("User registered successfully!");
    }
}
