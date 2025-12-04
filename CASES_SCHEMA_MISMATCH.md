# Cases System - Database Schema Mismatch Found

## ❌ CRITICAL ISSUE DISCOVERED

The **backend code** expects a different database schema than what exists in your **actual database**.

---

## 🔍 Schema Comparison

### Backend Code Expects (from schema.sql and routes):
```sql
CREATE TABLE caseItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caseVersionId INT NOT NULL,  -- References caseVersions
    robloxId VARCHAR(255),        -- Roblox item ID
    name VARCHAR(255) NOT NULL,   -- Item name stored here
    img VARCHAR(255),             -- Image URL
    price DECIMAL(15,2) NOT NULL, -- Item price stored here
    rangeFrom INT NOT NULL,       -- Probability range start (0-100000)
    rangeTo INT NOT NULL,         -- Probability range end (0-100000)
    FOREIGN KEY (caseVersionId) REFERENCES caseVersions(id)
);
```

### Actual Database Has:
```sql
CREATE TABLE caseItems (
    id INT NOT NULL,
    caseId INT NOT NULL,          -- Direct reference to cases (not versions)
    itemId INT NOT NULL,          -- Reference to separate items table
    weight DECIMAL(8,4) NOT NULL  -- Different probability system
    -- NO robloxId, name, img, price, rangeFrom, rangeTo
);
```

---

## 🚨 Impact

**The cases system CANNOT work** with the current database because:
1. Backend queries `SELECT rangeFrom, rangeTo FROM caseItems` → These columns don't exist
2. Backend tries `INSERT INTO caseItems (caseVersionId, ...)` → Column doesn't exist
3. Item data (name, price, img) is missing from caseItems table
4. Probability system is different (weight vs rangeFrom/rangeTo)

---

## ✅ SOLUTIONS

### **Option 1: Recreate Database with Correct Schema** (RECOMMENDED)

1. **Backup current database** (if it has any important data)
2. **Drop cases-related tables:**
   ```sql
   DROP TABLE IF EXISTS caseOpenings;
   DROP TABLE IF EXISTS caseItems;
   DROP TABLE IF EXISTS caseVersions;
   DROP TABLE IF EXISTS cases;
   ```

3. **Run the correct schema:**
   ```bash
   mysql -u avnadmin -p -h bloxrazon-db-bae82781-bdda.d.aivencloud.com -P 22243 --ssl-mode=REQUIRED defaultdb < database/schema.sql
   ```

4. **Seed the cases:**
   ```bash
   node database/seed-cases-fixed.js
   ```

### **Option 2: Rewrite Backend to Match Current Database**

This would require:
- Creating a separate `items` table
- Rewriting all case queries in `routes/games/cases/index.js`
- Changing probability calculation system
- Updating caching functions
- Modifying frontend to handle new data structure

**Estimated effort:** 4-6 hours of development

---

## 📝 Recommended Next Steps

1. **Verify if current database has important data:**
   ```bash
   node database/check-data.js
   ```

2. **If no important data, proceed with Option 1:**
   - Run migration script to fix schema
   - Seed cases from JSON
   - Test cases system

3. **If database has important data:**
   - Export important data first
   - Recreate schema
   - Import data back
   - Seed cases

---

## 🔧 Migration Script Created

I've created `database/migrate-cases-schema.sql` that will:
1. Drop old incompatible tables
2. Create new schema matching the code
3. Preserve any existing user data

Run it with:
```bash
mysql -u avnadmin -p -h bloxrazon-db-bae82781-bdda.d.aivencloud.com -P 22243 --ssl-mode=REQUIRED defaultdb < database/migrate-cases-schema.sql
```

Then seed cases:
```bash
node database/seed-cases-fixed.js
```

---

## ⚠️ Important Notes

- The current schema appears to be from a different version of the application
- The `schema.sql` file in your codebase matches what the code expects
- You must use `schema.sql` as the source of truth
- The seed script needs to be updated to work with the correct schema

---

**Status:** ❌ Cases system is non-functional until schema is fixed
**Priority:** HIGH - This affects core game functionality
