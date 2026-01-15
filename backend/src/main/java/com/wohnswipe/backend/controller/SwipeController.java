package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.dto.SwipeRequest;
import com.wohnswipe.backend.dto.SwipeResponse;
import com.wohnswipe.backend.entity.GeneratedMessage;
import com.wohnswipe.backend.repository.GeneratedMessageRepository;
import com.wohnswipe.backend.repository.UserRepository;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.service.SwipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/swipes")
public class SwipeController {

    @Autowired
    SwipeService swipeService;

    @Autowired
    GeneratedMessageRepository generatedMessageRepository;
    
    @Autowired
    UserRepository userRepository;

    @PostMapping
    public SwipeResponse swipe(@RequestBody SwipeRequest request) {
        return swipeService.processSwipe(request);
    }
    
    @GetMapping("/messages/{listingId}")
    public GeneratedMessage getMessage(@PathVariable Long listingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        return generatedMessageRepository.findByListingIdAndUserId(listingId, user.getId())
                .orElse(null);
    }
}
