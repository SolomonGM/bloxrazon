-- QUICK FIX FOR RAKEBACK CLAIMS ERROR
-- Run this directly in your MySQL database

-- Fix the type column to use proper ENUM
ALTER TABLE rakebackClaims 
MODIFY COLUMN type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL;

-- Verify the fix worked
DESCRIBE rakebackClaims;
