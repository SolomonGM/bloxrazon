-- BloxRazon Database Schema
-- This is a basic schema with the minimum tables needed for the mines game

CREATE DATABASE IF NOT EXISTS bloxrazon;
USE bloxrazon;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    balance DECIMAL(15,2) DEFAULT 0.00,
    xp DECIMAL(15,2) DEFAULT 0.00,
    role ENUM('user', 'admin', 'moderator', 'BOT') DEFAULT 'user',
    anon BOOLEAN DEFAULT FALSE,
    mentionsEnabled BOOLEAN DEFAULT TRUE,
    banned BOOLEAN DEFAULT FALSE,
    sponsorLock BOOLEAN DEFAULT FALSE,
    accountLock BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    robloxCookie TEXT NULL,
    proxy VARCHAR(255) NULL,
    perms JSON NULL,
    affiliateCode VARCHAR(255) NULL UNIQUE,
    affiliateEarningsOffset DECIMAL(15,2) DEFAULT 0.00,
    affiliateCodeLock BOOLEAN DEFAULT FALSE,
    leaderboardBan BOOLEAN DEFAULT FALSE,
    lastLogout TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Server seeds for provably fair gaming
CREATE TABLE IF NOT EXISTS serverSeeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    seed VARCHAR(255) NOT NULL,
    nonce INT DEFAULT 0,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Client seeds for provably fair gaming
CREATE TABLE IF NOT EXISTS clientSeeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    seed VARCHAR(255) NOT NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Mines game table
CREATE TABLE IF NOT EXISTS mines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    clientSeedId INT NOT NULL,
    serverSeedId INT NOT NULL,
    nonce INT NOT NULL,
    minesCount INT NOT NULL,
    mines JSON NOT NULL,
    revealedTiles JSON NOT NULL DEFAULT '[]',
    payout DECIMAL(15,2) DEFAULT 0.00,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (clientSeedId) REFERENCES clientSeeds(id),
    FOREIGN KEY (serverSeedId) REFERENCES serverSeeds(id)
);

-- Bets tracking table
CREATE TABLE IF NOT EXISTS bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    winnings DECIMAL(15,2) DEFAULT 0.00,
    edge DECIMAL(15,2) DEFAULT 0.00,
    game VARCHAR(50) NOT NULL,
    gameId INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    content JSON NOT NULL,
    readAt TIMESTAMP NULL,
    seen BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Rain system
CREATE TABLE IF NOT EXISTS rains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host INT NULL,
    amount DECIMAL(15,2) NOT NULL,
    participants JSON DEFAULT ('[]'),
    active BOOLEAN DEFAULT TRUE,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host) REFERENCES users(id)
);

-- Cases system
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    img VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caseVersions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caseId INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caseId) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS caseItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caseVersionId INT NOT NULL,
    robloxId VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    img VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    rangeFrom INT NOT NULL,
    rangeTo INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id)
);

CREATE TABLE IF NOT EXISTS fairRolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serverSeed VARCHAR(255) NOT NULL,
    clientSeed VARCHAR(255) NOT NULL,
    nonce INT NOT NULL,
    seed VARCHAR(255) NOT NULL,
    result INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caseOpenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    caseVersionId INT NOT NULL,
    rollId INT NOT NULL,
    caseItemId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id),
    FOREIGN KEY (caseItemId) REFERENCES caseItems(id)
);

-- Battles game
CREATE TABLE IF NOT EXISTS battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ownerId INT NOT NULL,
    entryPrice DECIMAL(15,2) DEFAULT 0.00,
    teams INT DEFAULT 2,
    playersPerTeam INT DEFAULT 1,
    round INT DEFAULT 0,
    privKey VARCHAR(255) NULL,
    minLevel INT DEFAULT 0,
    ownerFunding BOOLEAN DEFAULT FALSE,
    EOSBlock INT NULL,
    clientSeed VARCHAR(255) NULL,
    serverSeed VARCHAR(255) NULL,
    winnerTeam INT NULL,
    gamemode ENUM('standard', 'crazy', 'group') DEFAULT 'standard',
    startedAt TIMESTAMP NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS battleRounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    battleId INT NOT NULL,
    round INT NOT NULL,
    caseVersionId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (battleId) REFERENCES battles(id),
    INDEX idx_battle_round (battleId, round)
);

CREATE TABLE IF NOT EXISTS battlePlayers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    battleId INT NOT NULL,
    userId INT NOT NULL,
    slot INT NOT NULL,
    team INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (battleId) REFERENCES battles(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE KEY unique_battle_slot (battleId, slot)
);

CREATE TABLE IF NOT EXISTS battleOpenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    battleId INT NOT NULL,
    caseOpeningId INT NOT NULL,
    round INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (battleId) REFERENCES battles(id),
    INDEX idx_battle_round (battleId, round)
);

-- Coinflip game
CREATE TABLE IF NOT EXISTS coinflips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ownerId INT NOT NULL,
    fire INT NULL,
    ice INT NULL,
    amount DECIMAL(15,2) NOT NULL,
    winnerSide ENUM('fire', 'ice') NULL,
    privKey VARCHAR(255) NULL,
    minLevel INT DEFAULT 0,
    EOSBlock INT NULL,
    clientSeed VARCHAR(255) NULL,
    serverSeed VARCHAR(255) NULL,
    result INT NULL,
    startedAt TIMESTAMP NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id),
    FOREIGN KEY (fire) REFERENCES users(id),
    FOREIGN KEY (ice) REFERENCES users(id)
);

-- Crash game
CREATE TABLE IF NOT EXISTS crash (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId VARCHAR(255) NULL,
    multiplier DECIMAL(10,2) NULL,
    crashPoint DECIMAL(10,2) NULL,
    EOSBlock INT NULL,
    clientSeed VARCHAR(255) NULL,
    serverSeed VARCHAR(255) NULL,
    result INT NULL,
    startedAt TIMESTAMP NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crashBets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crashId INT NOT NULL,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    cashoutMultiplier DECIMAL(10,2) NULL,
    payout DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crashId) REFERENCES crash(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Jackpot game
CREATE TABLE IF NOT EXISTS jackpot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId VARCHAR(255) NULL,
    winnerId INT NULL,
    totalAmount DECIMAL(15,2) DEFAULT 0.00,
    EOSBlock INT NULL,
    clientSeed VARCHAR(255) NULL,
    serverSeed VARCHAR(255) NULL,
    result INT NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winnerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jackpotBets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jackpotId INT NOT NULL,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tickets INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jackpotId) REFERENCES jackpot(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Roulette game
CREATE TABLE IF NOT EXISTS roulette (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId VARCHAR(255) NULL,
    result INT NULL,
    color ENUM('red', 'green', 'gold') NULL,
    EOSBlock INT NULL,
    serverSeed VARCHAR(255) NULL,
    clientSeed VARCHAR(255) NULL,
    rolledAt TIMESTAMP NULL,
    endedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rouletteBets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roundId INT NOT NULL,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    color ENUM('red', 'green', 'gold') NOT NULL,
    payout DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roundId) REFERENCES roulette(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Slots game
CREATE TABLE IF NOT EXISTS slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NULL,
    providerGameId VARCHAR(255) NULL,
    version VARCHAR(50) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace/Trading
CREATE TABLE IF NOT EXISTS marketplaceListings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sellerId INT NOT NULL,
    buyerId INT NULL,
    robloxTradeId VARCHAR(255) NULL,
    boughtPrice DECIMAL(15,2) NULL,
    buyerItem JSON NULL,
    status ENUM('active', 'sold', 'cancelled') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES users(id),
    FOREIGN KEY (buyerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS marketplaceListingItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marketplaceListingId INT NOT NULL,
    userAssetId VARCHAR(255) NOT NULL,
    limitedId VARCHAR(255) NULL,
    discount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marketplaceListingId) REFERENCES marketplaceListings(id)
);

-- Crypto transactions
CREATE TABLE IF NOT EXISTS cryptoWithdraws (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    coin VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    txid VARCHAR(255) NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cryptoDeposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    coin VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    txid VARCHAR(255) NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Admin and configuration
CREATE TABLE IF NOT EXISTS adminConfig (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value JSON NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Survey/Offerwall rewards
CREATE TABLE IF NOT EXISTS surveyRewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    wall VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transactionId VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('daily', 'weekly') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endedAt TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS leaderboardUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leaderboardId INT NOT NULL,
    userId INT NOT NULL,
    position INT NOT NULL,
    totalWagered DECIMAL(15,2) DEFAULT 0.00,
    amountWon DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leaderboardId) REFERENCES leaderboards(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Discord integration
CREATE TABLE IF NOT EXISTS discordChannels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    cachedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discord auth tokens for linked accounts
CREATE TABLE IF NOT EXISTS discordAuths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    discordId VARCHAR(255) NOT NULL UNIQUE,
    token TEXT NOT NULL,
    tokenExpiresAt TIMESTAMP NOT NULL,
    refreshToken TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    uses INT DEFAULT 0,
    earnings DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Affiliate claims (tracks when a user claims affiliate earnings)
CREATE TABLE IF NOT EXISTS affiliateClaims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Rakeback
CREATE TABLE IF NOT EXISTS rakeback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Features table for enabling/disabling game modes
CREATE TABLE IF NOT EXISTS features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Banned phrases for chat moderation
CREATE TABLE IF NOT EXISTS bannedPhrases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phrase VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat system
CREATE TABLE IF NOT EXISTS chatChannels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatMessages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId INT NULL,
    channelId VARCHAR(50) DEFAULT 'general',
    content TEXT NOT NULL,
    type ENUM('message', 'system', 'rain', 'rain-end', 'rain-tip', 'user', 'clear', 'flex') DEFAULT 'message',
    replyTo INT NULL,
    deletedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (channelId) REFERENCES chatChannels(id)
);

CREATE TABLE IF NOT EXISTS rainUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rainId INT NOT NULL,
    userId INT NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rainId) REFERENCES rains(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE KEY unique_rain_user (rainId, userId)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type ENUM('in', 'out', 'deposit', 'withdraw') NOT NULL,
    method VARCHAR(50) NOT NULL,
    methodId VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Robux exchanges (deposits/withdrawals)
CREATE TABLE IF NOT EXISTS robuxExchanges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    totalAmount DECIMAL(15,2) NOT NULL,
    filledAmount DECIMAL(15,2) DEFAULT 0.00,
    operation ENUM('deposit', 'withdraw') NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Security keys for Roblox trading
CREATE TABLE IF NOT EXISTS securityKeys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    keyName VARCHAR(255) NOT NULL,
    privateKey TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Promo codes system
CREATE TABLE IF NOT EXISTS promoCodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    totalUses INT NULL,
    currentUses INT DEFAULT 0,
    minLvl INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promoCodeUses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    promoCodeId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (promoCodeId) REFERENCES promoCodes(id),
    UNIQUE KEY unique_user_promo (userId, promoCodeId)
);

-- Insert a test user for development
INSERT IGNORE INTO users (id, username, balance, xp) VALUES 
(1, 'testuser', 10000.00, 0.00);

-- Create initial server and client seeds for the test user
INSERT IGNORE INTO serverSeeds (userId, seed) VALUES 
(1, 'test-server-seed-123456789abcdef');

INSERT IGNORE INTO clientSeeds (userId, seed) VALUES 
(1, 'test-client-seed-987654321fedcba');

-- Insert default enabled features
INSERT IGNORE INTO features (name, enabled) VALUES
('mines', 1),
('crash', 1),
('roulette', 1),
('jackpot', 1),
('coinflip', 1),
('cases', 1),
('battles', 1),
('slots', 1),
('blackjack', 1),
('rain', 1),
('affiliates', 1),
('rakeback', 1),
('leaderboard', 1),
('robuxDeposits', 1),
('robuxWithdrawals', 1),
('limitedDeposits', 1),
('limitedWithdrawals', 1),
('cryptoDeposits', 1),
('cryptoWithdrawals', 1),
('cardDeposits', 0),
('fiatDeposits', 0);