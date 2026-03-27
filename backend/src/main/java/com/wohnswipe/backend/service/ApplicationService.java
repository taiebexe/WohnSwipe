package com.wohnswipe.backend.service;

import com.wohnswipe.backend.dto.ApplicationResponse;
import com.wohnswipe.backend.entity.*;
import com.wohnswipe.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private UserSettingsRepository userSettingsRepository;
    @Autowired
    private ListingRepository listingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GeneratedMessageRepository generatedMessageRepository;
    @Autowired
    private EmailService emailService;

    public boolean isAutoApplyEnabled(Long userId) {
        return userSettingsRepository.findById(userId)
                .map(UserSettings::getAutoApplyEnabled)
                .orElse(false);
    }

    public boolean canApplyToday(Long userId) {
        UserSettings settings = userSettingsRepository.findById(userId).orElse(null);
        int limit = settings != null ? settings.getDailyApplyLimit() : 10;
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long sentToday = applicationRepository.countSentSince(userId, startOfDay);
        return sentToday < limit;
    }

    @Transactional
    public Application createApplication(Long userId, Long listingId, Long generatedMessageId, String method) {
        Application app = new Application();
        app.setUserId(userId);
        app.setListingId(listingId);
        app.setGeneratedMessageId(generatedMessageId);
        app.setMethod(method);
        app.setStatus("PENDING");
        return applicationRepository.save(app);
    }

    @Async
    public void sendApplicationAsync(Long applicationId) {
        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) return;

        try {
            Listing listing = listingRepository.findById(app.getListingId()).orElseThrow();
            User user = userRepository.findById(app.getUserId()).orElseThrow();
            GeneratedMessage gm = generatedMessageRepository.findById(app.getGeneratedMessageId()).orElseThrow();

            if (listing.getContactEmail() == null || listing.getContactEmail().isBlank()) {
                app.setStatus("FAILED");
                app.setErrorMessage("No contact email available for this listing");
                applicationRepository.save(app);
                return;
            }

            String subject = "Wohnungsanfrage: " + listing.getTitle();
            emailService.sendApplication(
                    listing.getContactEmail(),
                    user.getEmail(),
                    gm.getContent().lines().reduce((first, second) -> second).orElse("Interessent"),
                    subject,
                    gm.getContent()
            );

            app.setStatus("SENT");
            app.setSentAt(LocalDateTime.now());
            applicationRepository.save(app);

        } catch (Exception e) {
            log.error("Failed to send application {}: {}", applicationId, e.getMessage());
            app.setStatus("FAILED");
            app.setErrorMessage(e.getMessage());
            applicationRepository.save(app);
        }
    }

    public Page<ApplicationResponse> getApplicationHistory(Long userId, Pageable pageable) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(app -> {
                    Listing listing = listingRepository.findById(app.getListingId()).orElse(null);
                    String message = null;
                    if (app.getGeneratedMessageId() != null) {
                        message = generatedMessageRepository.findById(app.getGeneratedMessageId())
                                .map(GeneratedMessage::getContent)
                                .orElse(null);
                    }
                    return new ApplicationResponse(app, listing, message);
                });
    }

    @Transactional
    public void retryApplication(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId).orElseThrow();
        if (!app.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (!"FAILED".equals(app.getStatus())) {
            throw new RuntimeException("Can only retry failed applications");
        }
        app.setStatus("PENDING");
        app.setErrorMessage(null);
        applicationRepository.save(app);
        sendApplicationAsync(applicationId);
    }
}
