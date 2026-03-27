package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.dto.ApplicationResponse;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.repository.UserRepository;
import com.wohnswipe.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public Page<ApplicationResponse> getApplicationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser();
        return applicationService.getApplicationHistory(user.getId(), PageRequest.of(page, size));
    }

    @PostMapping("/{id}/retry")
    public void retryApplication(@PathVariable Long id) {
        User user = getCurrentUser();
        applicationService.retryApplication(id, user.getId());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
