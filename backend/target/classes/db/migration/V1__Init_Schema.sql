CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255),
    age INT,
    job VARCHAR(255),
    net_income_range VARCHAR(50),
    move_in_date DATE,
    pets VARCHAR(255),
    smoker BOOLEAN,
    bio TEXT,
    districts VARCHAR(255), -- Comma separated
    max_rent DECIMAL(10, 2),
    preferred_rooms DOUBLE PRECISION,
    tone VARCHAR(50) DEFAULT 'friendly'
);

CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    district VARCHAR(255),
    address VARCHAR(255),
    rent DECIMAL(10, 2),
    rooms DOUBLE PRECISION,
    size_sqm DOUBLE PRECISION,
    description TEXT,
    available_from DATE,
    contact_email VARCHAR(255),
    landlord_name VARCHAR(255),
    image_url VARCHAR(500)
);

CREATE TABLE swipes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    listing_id BIGINT REFERENCES listings(id),
    direction VARCHAR(10), -- 'LEFT', 'RIGHT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

CREATE TABLE generated_messages (
    id BIGSERIAL PRIMARY KEY,
    swipe_id BIGINT REFERENCES swipes(id),
    user_id BIGINT REFERENCES users(id),
    listing_id BIGINT REFERENCES listings(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO listings (title, district, address, rent, rooms, size_sqm, description, available_from, landlord_name) VALUES
('Sunny Balcony Friedrichshain', 'Friedrichshain', 'Warschauer str. 10', 950.00, 2.0, 55.0, 'Beautiful sunny apartment near Boxhagener Platz.', '2026-02-01', 'Schmidt'),
('Modern Loft Mitte', 'Mitte', 'Torstr. 5', 1500.00, 1.5, 45.0, 'High ceilings, very central.', '2026-03-01', 'Müller GmbH'),
('Quiet Altbau Kreuzberg', 'Kreuzberg', 'Bergmannstr. 20', 1100.00, 2.5, 70.0, 'Classic Altbau details, quiet backyard.', '2026-02-15', 'Weber'),
('Cozy Studio Neukölln', 'Neukölln', 'Weserstr. 50', 700.00, 1.0, 35.0, 'Perfect for students, lively area.', '2026-01-20', 'Klein'),
('Family Apartment Prenzlauer Berg', 'Prenzlauer Berg', 'Danziger Str. 5', 1800.00, 4.0, 100.0, 'Spacious, near park.', '2026-04-01', 'Berger');
