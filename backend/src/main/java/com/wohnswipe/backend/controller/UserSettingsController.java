package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.dto.UserSettingsRequest;
import com.wohnswipe.backend.dto.UserSettingsResponse;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.entity.UserSettings;
import com.wohnswipe.backend.repository.UserRepository;
import com.wohnswipe.backend.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/settings")
public class UserSettingsController {

    @Autowired
    private UserSettingsRepository userSettingsRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public UserSettingsResponse getSettings() {
        User user = getCurrentUser();
        UserSettings settings = userSettingsRepository.findById(user.getId())
                .orElseGet(() -> {
                    UserSettings s = new UserSettings();
                    s.setUserId(user.getId());
                    return userSettingsRepository.save(s);
                });
        return new UserSettingsResponse(settings);
    }

    @PutMapping
    public UserSettingsResponse updateSettings(@RequestBody UserSettingsRequest request) {
        User user = getCurrentUser();
        UserSettings settings = userSettingsRepository.findById(user.getId())
                .orElseGet(() -> {
                    UserSettings s = new UserSettings();
                    s.setUserId(user.getId());
                    return s;
                });

        if (request.getAutoApplyEnabled() != null) {
            settings.setAutoApplyEnabled(request.getAutoApplyEnabled());
        }
        if (request.getDailyApplyLimit() != null) {
            settings.setDailyApplyLimit(Math.min(Math.max(request.getDailyApplyLimit(), 1), 50));
        }
        settings.setUpdatedAt(LocalDateTime.now());

        userSettingsRepository.save(settings);
        return new UserSettingsResponse(settings);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
