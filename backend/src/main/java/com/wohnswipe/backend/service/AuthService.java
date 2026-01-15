package com.wohnswipe.backend.service;

import com.wohnswipe.backend.dto.JwtResponse;
import com.wohnswipe.backend.dto.LoginRequest;
import com.wohnswipe.backend.dto.RegisterRequest;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.entity.UserProfile;
import com.wohnswipe.backend.repository.UserRepository;
import com.wohnswipe.backend.repository.UserProfileRepository;
import com.wohnswipe.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;
    
    @Autowired
    UserProfileRepository userProfileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public JwtResponse tbourbiaLogin(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        return new JwtResponse(jwt, user.getId(), user.getEmail());
    }

    @Transactional
    public void register(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);
        
        // Create empty profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setTone("friendly"); // default
        userProfileRepository.save(profile);
    }
}
