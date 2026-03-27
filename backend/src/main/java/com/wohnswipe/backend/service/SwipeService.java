package com.wohnswipe.backend.service;

import com.wohnswipe.backend.dto.SwipeRequest;
import com.wohnswipe.backend.dto.SwipeResponse;
import com.wohnswipe.backend.entity.*;
import com.wohnswipe.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Service
public class SwipeService {

    private static final Logger log = LoggerFactory.getLogger(SwipeService.class);

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
    ApplicationService applicationService;

    @Autowired
    RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public SwipeResponse processSwipe(SwipeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Swipe swipe = new Swipe();
        swipe.setUserId(user.getId());
        swipe.setListingId(request.getListingId());
        swipe.setDirection(request.getDirection());

        Swipe savedSwipe = swipeRepository.save(swipe);

        String message = null;
        boolean match = "RIGHT".equalsIgnoreCase(request.getDirection());

        if (match) {
            try {
                UserProfile profile = userProfileRepository.findById(user.getId()).orElseThrow();
                Listing listing = listingRepository.findById(request.getListingId()).orElseThrow();

                message = callAiService(profile, listing);

                GeneratedMessage gm = new GeneratedMessage();
                gm.setSwipeId(savedSwipe.getId());
                gm.setUserId(user.getId());
                gm.setListingId(listing.getId());
                gm.setContent(message);
                GeneratedMessage savedGm = generatedMessageRepository.save(gm);

                // Check if auto-apply is enabled and we can still apply today
                if (applicationService.isAutoApplyEnabled(user.getId())
                        && applicationService.canApplyToday(user.getId())
                        && listing.getContactEmail() != null
                        && !listing.getContactEmail().isBlank()) {

                    Application app = applicationService.createApplication(
                            user.getId(), listing.getId(), savedGm.getId(), "EMAIL");
                    applicationService.sendApplicationAsync(app.getId());

                    return new SwipeResponse(true, message, "PENDING", app.getId());
                }

                // Auto-apply not enabled or no email — user copies manually
                Application app = applicationService.createApplication(
                        user.getId(), listing.getId(), savedGm.getId(), "CLIPBOARD");
                app.setStatus("SENT");
                return new SwipeResponse(true, message, "CLIPBOARD", app.getId());

            } catch (Exception e) {
                log.error("Error processing right swipe for user {}: {}", user.getId(), e.getMessage());
                message = "Error generating message. Please try manually.";
            }
        }

        return new SwipeResponse(match, message);
    }

    private String callAiService(UserProfile user, Listing listing) {
        String url = aiServiceUrl + "/generate-message";

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", user);
        payload.put("listing", listing);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

        if (response != null && response.containsKey("message")) {
            return (String) response.get("message");
        }
        return "Could not generate message.";
    }
}
