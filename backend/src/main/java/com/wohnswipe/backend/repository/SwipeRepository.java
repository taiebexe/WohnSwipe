package com.wohnswipe.backend.repository;

import com.wohnswipe.backend.entity.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Set;

public interface SwipeRepository extends JpaRepository<Swipe, Long> {
    @Query("SELECT s.listingId FROM Swipe s WHERE s.userId = :userId")
    Set<Long> findSwipedListingIds(@Param("userId") Long userId);
}
