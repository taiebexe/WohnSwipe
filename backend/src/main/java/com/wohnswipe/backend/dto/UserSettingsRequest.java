package com.wohnswipe.backend.dto;

import lombok.Data;

@Data
public class UserSettingsRequest {
    private Boolean autoApplyEnabled;
    private Integer dailyApplyLimit;
}
