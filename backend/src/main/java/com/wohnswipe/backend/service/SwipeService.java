package com.wohnswipe.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wohnswipe.backend.dto.SwipeRequest;
import com.wohnswipe.backend.dto.SwipeResponse;
import com.wohnswipe.backend.entity.*;
import com.wohnswipe.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SwipeService {

    @Autowired
    SwipeRepository swipeRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    ListingRepository listingRepository;
    @Autowired
    GeneratedMessageRepository generatedMessageRepository;
    @Autowired
    UserProfileRepository userProfileRepository;
    
    @Autowired
    RestTemplate restTemplate;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public SwipeResponse processSwipe(SwipeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // Detect duplicates
        // Ideally should check before saving, DB has unique constraint
        
        Swipe swipe = new Swipe();
        swipe.setUserId(user.getId());
        swipe.setListingId(request.getListingId());
        swipe.setDirection(request.getDirection());
        
        Swipe savedSwipe = swipeRepository.save(swipe);
        
        String message = null;
        boolean match = "RIGHT".equalsIgnoreCase(request.getDirection());
        
        if (match) {
            // Generate Message via AI Service
            try {
                UserProfile profile = userProfileRepository.findById(user.getId()).orElseThrow();
                Listing listing = listingRepository.findById(request.getListingId()).orElseThrow();
                
                message = callAiService(profile, listing);
                
                GeneratedMessage gm = new GeneratedMessage();
                gm.setSwipeId(savedSwipe.getId());
                gm.setUserId(user.getId());
                gm.setListingId(listing.getId());
                gm.setContent(message);
                
                generatedMessageRepository.save(gm);
                
            } catch (Exception e) {
                // Fallback or log error
                message = "Error generating message. Please try manually.";
                e.printStackTrace();
            }
        }
        
        return new SwipeResponse(match, message);
    }
    
    private String callAiService(UserProfile user, Listing listing) {
        String url = aiServiceUrl + "/generate-message";
        
        // Construct payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("user", user);
        payload.put("listing", listing);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        
        // Expecting { "message": "..." }
        Map response = restTemplate.postForObject(url, entity, Map.class);
        
        if (response != null && response.containsKey("message")) {
            return (String) response.get("message");
        }
        return "Could not generate message.";
    }
}
