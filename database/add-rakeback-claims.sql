-- Create rakebackClaims table for tracking rakeback claims
-- This fixes the "Data truncated for column 'type'" error

CREATE TABLE IF NOT EXISTS rakebackClaims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    INDEX idx_user_type (userId, type),
    INDEX idx_user_created (userId, createdAt)
);
