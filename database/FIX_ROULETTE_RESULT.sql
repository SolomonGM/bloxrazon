-- Fix roulette table to allow NULL values for result column
-- Run this SQL when your database is running

-- Check current structure (optional)
DESCRIBE roulette;

-- Fix result column to allow NULL
ALTER TABLE roulette 
MODIFY COLUMN result INT NULL;

-- Fix color enum to include 'gold' instead of 'black'
ALTER TABLE roulette 
MODIFY COLUMN color ENUM('red', 'green', 'gold') NULL;

-- Fix rouletteBets color enum as well
ALTER TABLE rouletteBets 
MODIFY COLUMN color ENUM('red', 'green', 'gold') NOT NULL;

-- Verify changes
DESCRIBE roulette;
DESCRIBE rouletteBets;

SELECT 'Roulette tables fixed successfully!' AS status;
