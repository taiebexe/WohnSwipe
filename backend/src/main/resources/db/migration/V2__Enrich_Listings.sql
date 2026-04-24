UPDATE listings
SET
    description = 'Sunlit two-room flat with a balcony, warm wood floors and enough space for a calm home office setup close to cafes and the U-Bahn.',
    contact_email = 'hello@friedrichshain-homes.de',
    image_url = NULL
WHERE title = 'Sunny Balcony Friedrichshain';

UPDATE listings
SET
    description = 'Compact designer loft with built-in storage, strong natural light and a polished city-living feel right in the centre of Berlin.',
    contact_email = 'rentals@torstrliving.de',
    image_url = NULL
WHERE title = 'Modern Loft Mitte';

UPDATE listings
SET
    description = 'Classic Altbau with high ceilings, quiet inner courtyard views and a layout that works well for couples or remote workers.',
    contact_email = 'kontakt@bergmann-wohnungen.de',
    image_url = NULL
WHERE title = 'Quiet Altbau Kreuzberg';

UPDATE listings
SET
    description = 'Smart studio with efficient storage, great late-night food nearby and an easy setup for anyone moving quickly into the city.',
    contact_email = 'bewerbung@weserstr50.de',
    image_url = NULL
WHERE title = 'Cozy Studio Neukölln';

UPDATE listings
SET
    description = 'Generous family apartment near green spaces with flexible room layouts, plenty of daylight and strong day-to-day livability.',
    contact_email = 'homes@prenzl-family.de',
    image_url = NULL
WHERE title = 'Family Apartment Prenzlauer Berg';

INSERT INTO listings (
    title,
    district,
    address,
    rent,
    rooms,
    size_sqm,
    description,
    available_from,
    contact_email,
    landlord_name,
    image_url
)
SELECT
    'Creative Corner Loft',
    'Wedding',
    'Müllerstr. 118',
    980.00,
    2.0,
    58.0,
    'Bright corner apartment with industrial details, generous windows and enough room for both hosting and focused work.',
    '2026-05-15',
    'hello@wedding-lofts.de',
    'NordHaus',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM listings WHERE title = 'Creative Corner Loft'
);

INSERT INTO listings (
    title,
    district,
    address,
    rent,
    rooms,
    size_sqm,
    description,
    available_from,
    contact_email,
    landlord_name,
    image_url
)
SELECT
    'Canal View Studio',
    'Neukölln',
    'Maybachufer 14',
    890.00,
    1.5,
    41.0,
    'Stylish studio near the canal with a quiet sleeping alcove, lively surroundings and a move-in-ready feel.',
    '2026-05-01',
    'apply@maybachufer-living.de',
    'Urban Nest',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM listings WHERE title = 'Canal View Studio'
);

INSERT INTO listings (
    title,
    district,
    address,
    rent,
    rooms,
    size_sqm,
    description,
    available_from,
    contact_email,
    landlord_name,
    image_url
)
SELECT
    'Parkside Flat Prenzlauer Berg',
    'Prenzlauer Berg',
    'Greifswalder Str. 212',
    1620.00,
    3.0,
    78.0,
    'Balanced three-room flat with park access, clean renovations and a practical layout for long-term city living.',
    '2026-06-01',
    'homes@parkside-pb.de',
    'Kranich Immobilien',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM listings WHERE title = 'Parkside Flat Prenzlauer Berg'
);
