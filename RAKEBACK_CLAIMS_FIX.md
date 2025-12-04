# Rakeback Claims Fix

## Issues Fixed

### 1. Database Error: "Data truncated for column 'type'"
**Problem**: The backend code was trying to insert into a `rakebackClaims` table that didn't exist in the schema.

**Solution**: Created the missing table with proper structure.

### 2. UI Issue: Zero-amount claims not greyed out
**Problem**: When a rakeback is claimed and results in 0 amount, it should be greyed out like pending claims, but was still showing as claimable.

**Solution**: Updated the `canClaim` logic to require `reward > 0`.

---

## Database Setup

### Prerequisites
The database must be running. Start your backend server first:

```bash
npm run backend
# or for development with auto-reload:
npm run backend:dev
```

### Quick Fix (Recommended)
Once the backend/database is running, open a new terminal and run:

```bash
node database/fix-rakeback-claims-type.js
```

This will:
- Check if the table exists
- Modify the `type` column to ENUM if table exists
- Create the table with correct structure if it doesn't exist
- Add indexes for query optimization

### Option 1: Run SQL File (When Database is Connected)
```bash
# Connect to your MySQL database and run:
mysql -u your_user -p your_database < database/fix-rakeback-claims-type.sql
```

### Option 2: Manual SQL Query
```sql
-- If table exists but has wrong column type:
ALTER TABLE rakebackClaims 
MODIFY COLUMN type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL;

-- If table doesn't exist:
CREATE TABLE rakebackClaims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type ENUM('instant', 'daily', 'weekly', 'monthly') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    INDEX idx_user_type (userId, type),
    INDEX idx_user_created (userId, createdAt)
);
```

---

## Table Structure

**rakebackClaims**
- `id`: Auto-incrementing primary key
- `userId`: Foreign key to users table
- `type`: ENUM with values: 'instant', 'daily', 'weekly', 'monthly'
- `amount`: DECIMAL(15,2) - Amount claimed
- `createdAt`: Timestamp of claim
- Indexes on (userId, type) and (userId, createdAt) for query optimization

---

## Code Changes

### src/components/Rakeback/tier.jsx
Updated the `canClaim` calculation to ensure zero-amount claims remain greyed out:

```javascript
// Before
const canClaim = props?.active && props?.reward >= props?.min

// After
const canClaim = props?.active && props?.reward >= props?.min && props?.reward > 0
```

This ensures:
- Card stays greyed out if reward is 0
- Card only becomes claimable if reward > 0 AND meets minimum threshold
- Consistent UI state with pending claims

---

## Testing

1. **Start the database** (if not already running)
2. **Run the migration** to create the rakebackClaims table
3. **Test rakeback claims**:
   - Claim a rakeback with positive amount ✓
   - Verify 0-amount rakebacks stay greyed out ✓
   - Check that claims are properly recorded in database ✓

---

## Files Created/Modified

### Created:
- `database/fix-rakeback-claims-type.js` - **Main fix script** (run this!)
- `database/fix-rakeback-claims-type.sql` - SQL fix for manual execution
- `database/add-rakeback-claims.sql` - SQL migration for new installations
- `database/add-rakeback-claims-table.js` - Node.js migration script
- `RAKEBACK_CLAIMS_FIX.md` - This documentation

### Modified:
- `src/components/Rakeback/tier.jsx` - Updated canClaim logic

---

## Error Details (For Reference)

**Original Error:**
```
Error: Data truncated for column 'type' at row 1
  errno: 1265,
  sql: "INSERT INTO rakebackClaims (userId, type, amount) VALUES (2, 'instant', 458.71)",
  sqlState: '01000',
  sqlMessage: "Data truncated for column 'type' at row 1"
```

**Root Cause**: The `rakebackClaims` table either didn't exist or had an incorrectly sized `type` column.

**Fix**: Created table with ENUM type that properly handles 'instant', 'daily', 'weekly', 'monthly' values.
