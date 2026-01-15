package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.entity.UserProfile;
import com.wohnswipe.backend.repository.UserProfileRepository;
import com.wohnswipe.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me")
public class UserProfileController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @GetMapping
    public UserProfile getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return userProfileRepository.findById(user.getId()).orElseThrow();
    }

    @PutMapping("/profile")
    public UserProfile updateProfile(@RequestBody UserProfile profileData) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        UserProfile profile = userProfileRepository.findById(user.getId()).orElseThrow();
        
        // Update fields
        profile.setName(profileData.getName());
        profile.setAge(profileData.getAge());
        profile.setJob(profileData.getJob());
        profile.setNetIncomeRange(profileData.getNetIncomeRange());
        profile.setMoveInDate(profileData.getMoveInDate());
        profile.setPets(profileData.getPets());
        profile.setSmoker(profileData.getSmoker());
        profile.setBio(profileData.getBio());
        profile.setDistricts(profileData.getDistricts());
        profile.setMaxRent(profileData.getMaxRent());
        profile.setPreferredRooms(profileData.getPreferredRooms());
        profile.setTone(profileData.getTone());
        
        return userProfileRepository.save(profile);
    }
}
