package com.wohnswipe.backend.controller;

import com.wohnswipe.backend.entity.Listing;
import com.wohnswipe.backend.entity.User;
import com.wohnswipe.backend.entity.UserProfile;
import com.wohnswipe.backend.repository.ListingRepository;
import com.wohnswipe.backend.repository.SwipeRepository;
import com.wohnswipe.backend.repository.UserProfileRepository;
import com.wohnswipe.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
    public Page<Listing> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        UserProfile profile = userProfileRepository.findById(user.getId()).orElseThrow();

        Set<Long> swipedIds = swipeRepository.findSwipedListingIds(user.getId());

        // Fetch more than requested to account for filtering swiped ones
        Page<Listing> potentialMatches = listingRepository.findMatchingListingsPaged(
                profile.getMaxRent(),
                profile.getPreferredRooms(),
                profile.getMoveInDate(),
                PageRequest.of(page, size * 2)
        );

        List<Listing> filtered = potentialMatches.getContent().stream()
                .filter(l -> !swipedIds.contains(l.getId()))
                .limit(size)
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, PageRequest.of(page, size), potentialMatches.getTotalElements());
    }
}
