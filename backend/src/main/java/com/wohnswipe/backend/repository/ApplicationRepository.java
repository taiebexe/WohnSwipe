package com.wohnswipe.backend.repository;

import com.wohnswipe.backend.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Application> findByUserIdAndListingId(Long userId, Long listingId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.userId = :userId AND a.sentAt >= :since AND a.status = 'SENT'")
    long countSentSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
