-- Initialize the VirtuLearn database if it doesn't exist
CREATE DATABASE IF NOT EXISTS virtulearn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure the user exists and has the right permissions
CREATE USER IF NOT EXISTS 'virtulearn_user'@'%' IDENTIFIED BY 'virtulearn_password';
GRANT ALL PRIVILEGES ON virtulearn.* TO 'virtulearn_user'@'%';

FLUSH PRIVILEGES;