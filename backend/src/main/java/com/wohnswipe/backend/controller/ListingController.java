package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.entity.Listing;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.entity.UserProfile;
import com.wohnswipe.backend.repository.ListingRepository;
import com.wohnswipe.backend.repository.SwipeRepository;
import com.wohnswipe.backend.repository.UserProfileRepository;
import com.wohnswipe.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/listings")
public class ListingController {
    
    @Autowired
    ListingRepository listingRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    UserProfileRepository userProfileRepository;
    @Autowired
    SwipeRepository swipeRepository;

    @GetMapping("/feed")
    public List<Listing> getFeed() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        UserProfile profile = userProfileRepository.findById(user.getId()).orElseThrow();

        // Get swiped IDs
        Set<Long> swipedIds = swipeRepository.findSwipedListingIds(user.getId());

        // Get matching listings
        List<Listing> potentialMatches = listingRepository.findMatchingListings(
            profile.getMaxRent(), 
            profile.getPreferredRooms(), 
            profile.getMoveInDate()
        );

        // Filter valid listings that haven't been swiped
        // For simple MVP we filter swiped ones in memory or could add to query
        // "findMatchingListings" does not exclude swiped ones yet.
        
        return potentialMatches.stream()
                .filter(l -> !swipedIds.contains(l.getId()))
                .collect(Collectors.toList());
    }
}
