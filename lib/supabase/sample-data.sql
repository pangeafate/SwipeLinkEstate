-- Enhanced sample data with property images from the PropertyImages folder
-- Run this AFTER the main schema.sql

-- Clear existing sample data
DELETE FROM properties;

-- Insert properties with real images from the PropertyImages folder
INSERT INTO properties (
    id,
    address, 
    price, 
    bedrooms, 
    bathrooms, 
    area_sqft, 
    description, 
    features, 
    cover_image,
    images,
    status
) VALUES 
-- Apartment 1
(
    'apt-1-oceanfront',
    '123 Ocean Drive, Miami Beach, FL 33139',
    850000,
    2,
    2.0,
    1200,
    'Stunning oceanfront condo with panoramic views of the Atlantic Ocean. This modern 2-bedroom, 2-bathroom unit features floor-to-ceiling windows, a spacious balcony, and access to world-class amenities including a rooftop pool, fitness center, and 24/7 concierge service.',
    '["Ocean View", "Balcony", "Pool", "Gym", "Concierge", "Modern Kitchen"]',
    '/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp',
    '["/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp", "/images/properties/Apartment 1/1b8ed1647b39d2d109fecd9a6f51347f.webp", "/images/properties/Apartment 1/486f7485494934d78970542bf8c21411.webp", "/images/properties/Apartment 1/79766678faa8d1e4370aefc7c8cd8b32.webp", "/images/properties/Apartment 1/83e4294427ebd50d46c565544dee70c4.webp"]',
    'active'
),

-- Apartment 2  
(
    'apt-2-luxury',
    '456 Collins Avenue, South Beach, FL 33139', 
    1250000,
    3,
    2.5,
    1800,
    'Luxury penthouse in the heart of South Beach with breathtaking city and ocean views. This spacious 3-bedroom, 2.5-bathroom residence features premium finishes, a gourmet kitchen, and a private rooftop terrace. Located steps from world-renowned restaurants, shopping, and nightlife.',
    '["Penthouse", "Rooftop Terrace", "City View", "Ocean View", "Premium Finishes", "South Beach Location"]',
    '/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp',
    '["/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp", "/images/properties/Apartment 2/cc6ced18d0f1931ca493c80e8f58ab04.webp", "/images/properties/Apartment 2/db0ff6b479a0a729313108a635b81653.webp", "/images/properties/Apartment 2/df007c9083b7168e7e8a093cd1516660.webp"]',
    'active'
),

-- Apartment 3
(
    'apt-3-modern', 
    '789 Lincoln Road, Miami Beach, FL 33140',
    650000,
    1,
    1.0,
    900,
    'Modern studio apartment with high-end finishes and contemporary design. Located on prestigious Lincoln Road, this unit offers the perfect blend of luxury and convenience. Features include stainless steel appliances, marble countertops, and access to building amenities.',
    '["Modern Design", "High Ceilings", "Stainless Appliances", "Marble Countertops", "Lincoln Road"]',
    '/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg',
    '["/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg", "/images/properties/Apartment 3/hd_zp_at_67fce86f2d57c-scaled.jpeg", "/images/properties/Apartment 3/hd_zp_at_67fce88e9a123-scaled.jpeg"]',
    'active'
),

-- House 1
(
    'house-1-family',
    '321 Washington Avenue, Miami Beach, FL 33139',
    2100000,
    4,
    3.5, 
    2500,
    'Spacious family home with private pool and garden in prime Miami Beach location. This beautiful 4-bedroom, 3.5-bathroom house offers ample space for entertaining with an open-concept living area, gourmet kitchen, and multiple outdoor spaces. Perfect for families seeking luxury and comfort.',
    '["Private Pool", "Garden", "Garage", "Family Room", "Open Concept", "Gourmet Kitchen"]',
    '/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg',
    '["/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg", "/images/properties/House 1/property-image-7e7e34df-f007-4d33-b531-05e2ddfe3ed4-1755444911.jpg", "/images/properties/House 1/property-image-b1d25d8c-4f94-4a73-a418-4d4cfd5ab979-1755444911.jpg"]',
    'active'
),

-- House 2
(
    'house-2-waterfront',
    '654 Bay Drive, Miami Beach, FL 33154',
    3500000,
    5,
    4.0,
    3200, 
    'Spectacular waterfront estate with private dock and panoramic bay views. This magnificent 5-bedroom, 4-bathroom home features luxurious appointments throughout, including a chef''s kitchen, wine cellar, and resort-style outdoor living area with infinity pool and spa.',
    '["Waterfront", "Private Dock", "Bay Views", "Infinity Pool", "Wine Cellar", "Chef Kitchen"]',
    '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png',
    '["/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png", "/images/properties/House 2/Screenshot 2025-08-18 at 11.18.59 AM.png", "/images/properties/House 2/Screenshot 2025-08-18 at 11.19.10 AM.png"]',
    'active'
),

-- House 3
(
    'house-3-contemporary',
    '987 Sunset Harbor Drive, Miami Beach, FL 33139', 
    1850000,
    3,
    2.5,
    2200,
    'Contemporary home with sleek design and premium amenities in sought-after Sunset Harbor. This 3-bedroom, 2.5-bathroom residence showcases clean lines, floor-to-ceiling windows, and an open floor plan. The property includes a private courtyard and is walking distance to trendy restaurants and marinas.',
    '["Contemporary Design", "Floor to Ceiling Windows", "Open Floor Plan", "Private Courtyard", "Sunset Harbor"]',
    '/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg',
    '["/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg", "/images/properties/House 3/hd_zp_at_6808c7184f281-scaled.jpeg", "/images/properties/House 3/hd_zp_at_6808c71b60b57-scaled.jpeg", "/images/properties/House 3/hd_zp_at_685bc663652e1.jpeg"]',
    'active'
);

-- Create a sample link with multiple properties
INSERT INTO links (id, code, name, property_ids, created_at) VALUES 
(
    'link-miami-collection',
    'MIAMI01X',
    'Miami Beach Luxury Collection',
    '["apt-1-oceanfront", "apt-2-luxury", "house-1-family", "house-2-waterfront"]',
    NOW()
);

-- Add some sample activities
INSERT INTO sessions (id, link_id, started_at, device_info) VALUES 
(
    'session-demo-001',
    'link-miami-collection', 
    NOW() - INTERVAL '2 hours',
    '{"userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)", "device": "mobile"}'
);

INSERT INTO activities (link_id, property_id, action, session_id, metadata) VALUES 
('link-miami-collection', 'apt-1-oceanfront', 'view', 'session-demo-001', '{"duration": 15}'),
('link-miami-collection', 'apt-1-oceanfront', 'like', 'session-demo-001', '{"swipeDirection": "right"}'),
('link-miami-collection', 'apt-2-luxury', 'view', 'session-demo-001', '{"duration": 22}'),
('link-miami-collection', 'apt-2-luxury', 'like', 'session-demo-001', '{"swipeDirection": "right"}'),
('link-miami-collection', 'house-1-family', 'view', 'session-demo-001', '{"duration": 8}'),
('link-miami-collection', 'house-1-family', 'dislike', 'session-demo-001', '{"swipeDirection": "left"}'),
('link-miami-collection', 'house-2-waterfront', 'view', 'session-demo-001', '{"duration": 45}'),
('link-miami-collection', 'house-2-waterfront', 'consider', 'session-demo-001', '{"swipeDirection": "down"}')