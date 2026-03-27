-- Add source tracking to listings
ALTER TABLE listings ADD COLUMN source VARCHAR(50);
ALTER TABLE listings ADD COLUMN source_url VARCHAR(500);
ALTER TABLE listings ADD COLUMN external_id VARCHAR(255);
ALTER TABLE listings ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE listings ADD COLUMN scraped_at TIMESTAMP;

-- Backfill existing seed data
UPDATE listings SET source = 'SEED' WHERE source IS NULL;

-- Deduplication constraint
ALTER TABLE listings ADD CONSTRAINT uq_listings_source_external_id UNIQUE (source, external_id);

-- Application tracking
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    listing_id BIGINT REFERENCES listings(id),
    generated_message_id BIGINT REFERENCES generated_messages(id),
    method VARCHAR(50) NOT NULL,          -- EMAIL, CLIPBOARD
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- User settings for auto-apply
CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    auto_apply_enabled BOOLEAN DEFAULT FALSE,
    daily_apply_limit INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
