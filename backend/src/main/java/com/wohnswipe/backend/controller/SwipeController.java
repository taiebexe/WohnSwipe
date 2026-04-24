package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.dto.MatchSummaryResponse;
import com.wohnswipe.backend.dto.SwipeRequest;
import com.wohnswipe.backend.dto.SwipeResponse;
import com.wohnswipe.backend.entity.GeneratedMessage;
import com.wohnswipe.backend.entity.Listing;
import com.wohnswipe.backend.repository.GeneratedMessageRepository;
import com.wohnswipe.backend.repository.ListingRepository;
import com.wohnswipe.backend.repository.UserRepository;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.service.SwipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/swipes")
public class SwipeController {

    @Autowired
    SwipeService swipeService;

    @Autowired
    GeneratedMessageRepository generatedMessageRepository;

    @Autowired
    ListingRepository listingRepository;
    
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

    @GetMapping("/matches")
    public List<MatchSummaryResponse> getMatches() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<GeneratedMessage> messages = generatedMessageRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        List<Long> listingIds = messages.stream()
                .map(GeneratedMessage::getListingId)
                .distinct()
                .toList();

        Map<Long, Listing> listingsById = listingRepository.findAllById(listingIds).stream()
                .collect(Collectors.toMap(Listing::getId, Function.identity()));

        return messages.stream()
                .map(message -> {
                    Listing listing = listingsById.get(message.getListingId());
                    if (listing == null) {
                        return null;
                    }

                    return new MatchSummaryResponse(
                            listing.getId(),
                            listing.getTitle(),
                            listing.getDistrict(),
                            listing.getAddress(),
                            listing.getRent(),
                            listing.getRooms(),
                            listing.getSizeSqm(),
                            listing.getDescription(),
                            listing.getAvailableFrom(),
                            listing.getLandlordName(),
                            listing.getContactEmail(),
                            listing.getImageUrl(),
                            message.getContent(),
                            message.getCreatedAt()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }
}
