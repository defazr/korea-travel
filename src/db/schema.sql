-- Korea Travel Data Platform
-- Database Schema v1

CREATE DATABASE korea_travel;

\c korea_travel;

-- Core places table
CREATE TABLE places (
    content_id BIGINT PRIMARY KEY,
    content_type_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    addr1 VARCHAR(500),
    addr2 VARCHAR(500),
    area_code INTEGER,
    sigungucode INTEGER,
    mapx DOUBLE PRECISION,
    mapy DOUBLE PRECISION,
    tel VARCHAR(200),
    first_image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Place details table
CREATE TABLE place_details (
    content_id BIGINT PRIMARY KEY REFERENCES places(content_id),
    overview TEXT,
    homepage TEXT,
    open_time VARCHAR(500),
    rest_date VARCHAR(500),
    parking VARCHAR(500),
    use_time VARCHAR(500)
);

-- Place images table
CREATE TABLE place_images (
    id SERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL REFERENCES places(content_id),
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_places_content_type ON places(content_type_id);
CREATE INDEX idx_places_area_code ON places(area_code);
CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_coords ON places(mapx, mapy);
CREATE INDEX idx_place_images_content ON place_images(content_id);
