CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- Drop tables in order of dependency
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS room_categories;
DROP TABLE IF EXISTS admins;

-- 1. Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Room Categories Table (3NF: Separates room details from specific room instances)
CREATE TABLE room_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name ENUM('standard', 'deluxe', 'sweet', 'executive', 'family') NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    amenities JSON, -- Modern SQL standard for lists, ensures atomic operations within the category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table (3NF: References category, only stores instance-specific data like room number)
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    room_number INT NOT NULL UNIQUE,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    amenities JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES room_categories(id) ON DELETE CASCADE
);

-- 4. Guests Table (3NF: Separates guest details from booking transactions)
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table (3NF: References both guest and room, stores only transactional data)
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ==========================================
-- INITIAL DATA INSERTION
-- ==========================================

-- Insert Admin (password: admin123)
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert Room Categories
INSERT INTO room_categories (category_name, price, capacity, image_url, amenities) 
VALUES 
('standard', 56.74, '3-4 guests', 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4', '["Free WiFi", "Air Conditioning", "Hot & Cold Shower", "TV", "Complimentary Water"]'),
('deluxe', 64.85, '4-5 guests', 'https://images.unsplash.com/photo-1776763255122-3d35e32aee64', '["Free WiFi", "Air Conditioning", "Hot & Cold Shower", "Mini Refrigerator", "Work Desk"]'),
('sweet', 89.17, '5-6 guests', 'https://images.unsplash.com/photo-1776763255197-495b343d5a33', '["Free WiFi", "Air Conditioning", "Hot & Cold Shower", "Coffee Maker", "Balcony View"]'),
('executive', 145.91, '5 guests', 'https://images.unsplash.com/photo-1777170191230-3f357b815483', '["King-size Bed", "Smart TV", "In-room Safe", "Premium Toiletries"]'),
('family', 162.13, '10 guests', 'https://images.unsplash.com/photo-1776761363365-ad83248b93df', '["Dining Table", "Microwave", "Extra Storage Space", "2 Beds"]');

-- Insert Rooms (Mapping to Categories)
INSERT INTO rooms (category_id, room_number, status) 
VALUES 
-- Standard (Category ID: 1)
(1, 101, 'available'), (1, 102, 'available'), (1, 103, 'available'), (1, 104, 'available'), (1, 105, 'available'),
-- Deluxe (Category ID: 2)
(2, 201, 'available'), (2, 202, 'available'), (2, 203, 'available'), (2, 204, 'available'), (2, 205, 'available'),
-- Sweet (Category ID: 3)
(3, 301, 'available'), (3, 302, 'available'), (3, 303, 'available'), (3, 304, 'available'), (3, 305, 'available'),
-- Executive (Category ID: 4)
(4, 401, 'available'), (4, 402, 'available'), (4, 403, 'available'), (4, 404, 'available'), (4, 405, 'available'),
-- Family (Category ID: 5)
(5, 501, 'available'), (5, 502, 'available'), (5, 503, 'available'), (5, 504, 'available'), (5, 505, 'available');

-- Insert Initial Guests
INSERT INTO guests (id, name, email, phone) VALUES
(1, 'Steven Ochigue', 'steve@example.com', '+63 912 345 6789'),
(2, 'Jane Doe', 'jane@example.com', '+63 923 456 7890'),
(3, 'Robert Miller', 'miller@example.com', '+1 (555) 019-2834');

-- Insert Initial Bookings (1 approved, 1 pending, 1 confirmed)
INSERT INTO bookings (id, guest_id, room_id, check_in, check_out, total_price, status) VALUES
(101, 1, 3, '2026-06-01', '2026-06-05', 226.96, 'approved'),
(102, 2, 8, '2026-05-24', '2026-05-27', 194.55, 'pending'),
(103, 3, 21, '2026-07-10', '2026-07-15', 810.65, 'confirmed');
