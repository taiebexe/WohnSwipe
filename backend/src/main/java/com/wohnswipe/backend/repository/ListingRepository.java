package com.wohnswipe.backend.repository;

import com.wohnswipe.backend.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    @Query("SELECT l FROM Listing l WHERE (l.isActive = true) AND (:maxRent IS NULL OR l.rent <= :maxRent) AND (:minRooms IS NULL OR l.rooms >= :minRooms) AND (:moveInDate IS NULL OR l.availableFrom <= :moveInDate) ORDER BY l.scrapedAt DESC NULLS LAST")
    List<Listing> findMatchingListings(@Param("maxRent") BigDecimal maxRent, @Param("minRooms") Double minRooms, @Param("moveInDate") LocalDate moveInDate);

    @Query("SELECT l FROM Listing l WHERE (l.isActive = true) AND (:maxRent IS NULL OR l.rent <= :maxRent) AND (:minRooms IS NULL OR l.rooms >= :minRooms) AND (:moveInDate IS NULL OR l.availableFrom <= :moveInDate) ORDER BY l.scrapedAt DESC NULLS LAST")
    Page<Listing> findMatchingListingsPaged(@Param("maxRent") BigDecimal maxRent, @Param("minRooms") Double minRooms, @Param("moveInDate") LocalDate moveInDate, Pageable pageable);
}
