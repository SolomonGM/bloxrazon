ALTER TABLE roulette MODIFY COLUMN result INT NULL;
ALTER TABLE roulette MODIFY COLUMN color ENUM('red', 'green', 'gold') NULL;
ALTER TABLE rouletteBets MODIFY COLUMN color ENUM('red', 'green', 'gold') NOT NULL;
