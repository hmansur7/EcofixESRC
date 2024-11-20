CREATE DATABASE EcoFix_Education;
USE EcoFix_Education;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type ENUM('Article', 'Video', 'Webinar', 'Guide', 'Module') NOT NULL,
    url VARCHAR(2083) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_Progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    points_earned INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES Content(content_id) ON DELETE CASCADE
);

CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    capacity INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Event_Registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE
);

CREATE TABLE Admin_Content_Management (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Insert sample users
INSERT INTO Users (name, email, password)
VALUES 
    ('John Doe', 'john.doe@example.com', 'password123'),
    ('Jane Smith', 'jane.smith@example.com', 'securepass'),
    ('Alice Johnson', 'alice.johnson@example.com', 'mypassword');

-- Insert sample content
INSERT INTO Content (title, description, content_type, url)
VALUES
    ('Introduction to Solar Energy', 'Learn about the basics of solar energy.', 'Module', 'https://www.coursera.org/learn/solar-energy-basics'),
    ('Wind Energy Basics', 'An overview of wind energy and turbines.', 'Video', 'http://example.com/wind'),
    ('Climate Change Webinar', 'Join our webinar on climate change.', 'Webinar', 'http://example.com/webinar'),
    ('Guide to Recycling', 'A complete guide to recycling effectively.', 'Guide', 'http://example.com/recycling');

-- Insert sample user progress
INSERT INTO User_Progress (user_id, content_id, status, points_earned)
VALUES
    (1, 1, 'In Progress', 10),
    (1, 2, 'Completed', 20),
    (2, 3, 'Not Started', 0),
    (3, 4, 'In Progress', 5);

-- Insert sample events
INSERT INTO Events (title, description, event_date, capacity)
VALUES
    ('Solar Energy Workshop', 'A workshop to learn about solar energy.', '2024-12-01 10:00:00', 50),
    ('Wind Energy Conference', 'A conference about wind energy.', '2024-12-15 14:00:00', 100),
    ('Recycling Drive', 'Participate in our recycling drive.', '2024-11-25 09:00:00', 30);

-- Insert sample event registrations
INSERT INTO Event_Registrations (user_id, event_id)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (1, 3);

-- Insert sample admin content management
INSERT INTO Admin_Content_Management (name, email, password)
VALUES
    ('Admin User', 'admin@example.com', 'adminpass'),
    ('Content Manager', 'manager@example.com', 'managerpass');