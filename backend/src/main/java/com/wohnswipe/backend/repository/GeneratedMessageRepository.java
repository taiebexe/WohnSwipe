package com.wohnswipe.backend.repository;

import com.wohnswipe.backend.entity.GeneratedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GeneratedMessageRepository extends JpaRepository<GeneratedMessage, Long> {
    Optional<GeneratedMessage> findByListingIdAndUserId(Long listingId, Long userId);
}
