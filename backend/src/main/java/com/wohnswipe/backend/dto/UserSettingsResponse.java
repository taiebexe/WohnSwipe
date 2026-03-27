package com.wohnswipe.backend.dto;

import com.wohnswipe.backend.entity.UserSettings;
import lombok.Data;

@Data
public class UserSettingsResponse {
    private boolean autoApplyEnabled;
    private int dailyApplyLimit;

    public UserSettingsResponse(UserSettings settings) {
        this.autoApplyEnabled = settings.getAutoApplyEnabled() != null && settings.getAutoApplyEnabled();
        this.dailyApplyLimit = settings.getDailyApplyLimit() != null ? settings.getDailyApplyLimit() : 10;
    }
}
