// Load .env file if it exists (for local development)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.production' });
} else {
    require('dotenv').config();
}
const express = require('express');
const nocache = require("nocache");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const rfs = require('rotating-file-stream');
const io = require('./socketio/server');
const cookieParser = require('cookie-parser');

const app = express();
app.disable('x-powered-by');

if (process.env.NODE_ENV == 'development') {

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            res.header("Access-Control-Allow-Origin", origin);
        } else {
            res.header("Access-Control-Allow-Origin", "*");
        }
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header('Access-Control-Max-Age', '7200');
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });

} else {

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        // Allow localhost and 127.0.0.1 for local development
        if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Credentials", "true");
        } else if (req.path.startsWith('/slots/hacksaw')) {
            res.header("Access-Control-Allow-Origin", "https://static-live.hacksawgaming.com");
        }
        res.header("Access-Control-Allow-Headers", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header('Access-Control-Max-Age', '7200');
        next();
    });

}

app.options('*', (req, res) => {
    res.sendStatus(204);
});

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev', {
        skip: (req, res) => req.url.endsWith('/img')
    }));
}

morgan.token('ip', function(req, res) {
    return req.headers['cf-connecting-ip']
});

morgan.token('user-agent', function(req, res) {
    return req.headers['user-agent']
});

const logDirectory = path.join(__dirname, 'logs');

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory,
    size: "10M",
    // compress: 'gzip'
});

app.use(morgan('[:date[clf]] :ip :method :url :status :response-time ms - :user-agent', {
    stream: accessLogStream,
    skip: (req, res) => req.url.endsWith('/img')
}));

app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawJsonBody = buf;
    }
}));

app.use(bodyParser.urlencoded({
    extended: true,
    verify: function (req, res, buf, encoding) {
        req.rawUrlBody = buf;
    }
}));

app.use(nocache());
app.use(cookieParser());

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const itemsRoute = require('./routes/items');
const tradingRoute = require('./routes/trading');
const discordRoute = require('./routes/discord');
const rainRoute = require('./routes/rain');
const leaderboardRoute = require('./routes/leaderboard');
const casesRoute = require('./routes/games/cases');
const battlesRoute = require('./routes/games/battles');
const rouletteRoute = require('./routes/games/roulette');
const crashRoute = require('./routes/games/crash');
const coinflipRoute = require('./routes/games/coinflip');
const jackpotRoute = require('./routes/games/jackpot');
const slotsRoute = require('./routes/games/slots');
const minesRoute = require('./routes/games/mines');
const blackjackRoute = require('./routes/games/blackjack');
const adminRoute = require('./routes/admin');
const surveysRoute = require('./routes/surveys');
const fairnessRoute = require('./routes/fairness');

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/items', itemsRoute);
app.use('/trading', tradingRoute);
app.use('/discord', discordRoute);
app.use('/rain', rainRoute);
app.use('/leaderboard', leaderboardRoute);
app.use('/cases', casesRoute);
app.use('/battles', battlesRoute);
app.use('/roulette', rouletteRoute);
app.use('/crash', crashRoute);
app.use('/coinflip', coinflipRoute);
app.use('/jackpot', jackpotRoute);
app.use('/slots', slotsRoute);
app.use('/mines', minesRoute);
app.use('/blackjack', blackjackRoute);
app.use('/admin', adminRoute);
app.use('/surveys', surveysRoute);
app.use('/fairness', fairnessRoute);

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route for SPA - must be AFTER API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const { cacheBets } = require('./socketio/bets');
const { cacheRains } = require('./socketio/rain');
const { cacheBattles } = require('./routes/games/battles/functions');
const { cacheCases, cacheDrops } = require('./routes/games/cases/functions');
const { cacheCrash } = require('./routes/games/crash/functions');
const { cacheCryptos } = require('./routes/trading/crypto/deposit/functions');
const { cacheWithdrawalCoins } = require('./routes/trading/crypto/withdraw/functions');
const { cacheJackpot } = require('./routes/games/jackpot/functions');
const { cacheRoulette } = require('./routes/games/roulette/functions');
const { cacheCoinflips } = require('./routes/games/coinflip/functions');
const { cacheChannels } = require('./socketio/chat/functions');
const { cacheItems } = require('./utils/roblox/items');
const { cacheListings } = require('./routes/trading/limiteds/functions');
const { cacheAdmin } = require('./routes/admin/config');
const { cacheSlots } = require('./routes/games/slots/functions');
const { cacheSurveys } = require('./routes/surveys/functions');
const { cacheLeaderboards } = require('./routes/leaderboard/functions');

async function updateCoinflipSchemaOnStart() {
    const { sql } = require('./database');
    try {
        // Update users role enum to include BOT
        console.log('[MIGRATION] Checking users.role enum...');
        try {
            await sql.query(`ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'moderator', 'BOT') DEFAULT 'user'`);
            console.log('[MIGRATION] ✓ Added BOT to role enum');
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                // Already exists
            } else {
                console.log('[MIGRATION] Role enum already updated or error:', e.message);
            }
        }

        // Check if creatorId column exists and remove it (deprecated)
        const [creatorIdCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'creatorId'
        `);

        if (creatorIdCheck.length > 0) {
            console.log('[MIGRATION] Removing deprecated creatorId column...');
            // First remove foreign key if exists
            try {
                const [fks] = await sql.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'coinflips' 
                    AND COLUMN_NAME = 'creatorId'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                `);
                for (const fk of fks) {
                    await sql.query(`ALTER TABLE coinflips DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                }
            } catch (e) {}
            
            await sql.query(`ALTER TABLE coinflips DROP COLUMN creatorId`);
            console.log('[MIGRATION] ✓ creatorId column removed');
        }

        // Check if ownerId column exists
        const [ownerIdCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'ownerId'
        `);

        if (ownerIdCheck.length === 0) {
            console.log('[MIGRATION] Adding ownerId column to coinflips...');
            await sql.query(`ALTER TABLE coinflips ADD COLUMN ownerId INT NOT NULL AFTER id`);
            await sql.query(`ALTER TABLE coinflips ADD CONSTRAINT fk_coinflips_owner FOREIGN KEY (ownerId) REFERENCES users(id)`);
            console.log('[MIGRATION] ✓ ownerId column added');
        }

        // Check if startedAt column exists
        const [startedAtCheck] = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'coinflips' 
            AND COLUMN_NAME = 'startedAt'
        `);

        if (startedAtCheck.length === 0) {
            console.log('[MIGRATION] Adding startedAt column to coinflips...');
            await sql.query(`ALTER TABLE coinflips ADD COLUMN startedAt TIMESTAMP NULL AFTER serverSeed`);
            console.log('[MIGRATION] ✓ startedAt column added');
        }

        // Ensure BOT user exists for coinflip
        const [bots] = await sql.query(`SELECT id, username FROM users WHERE role = 'BOT' LIMIT 1`);
        if (bots.length === 0) {
            console.log('[MIGRATION] Creating BOT user for coinflip...');
            await sql.query(`INSERT INTO users (username, role, balance, xp, anon) VALUES ('CoinflipBOT', 'BOT', 0, 0, 0)`);
            console.log('[MIGRATION] ✓ BOT user created');
        } else {
            console.log('[MIGRATION] ✓ BOT user exists:', bots[0].username);
        }

        // Rename old bot names to new format
        console.log('[MIGRATION] Checking bot names...');
        const botNameMapping = {
            'BotPlayer1': 'JeroldBOT',
            'BotPlayer2': 'TimmyBOT',
            'BotPlayer3': 'DanielBOT',
            'BotPlayer4': 'RaymondBOT',
            'BotPlayer5': 'EdwinBOT',
            'CoinflipBot': 'CoinflipBOT'
        };
        
        for (const [oldName, newName] of Object.entries(botNameMapping)) {
            const [[bot]] = await sql.query('SELECT id FROM users WHERE username = ? AND role = "BOT"', [oldName]);
            if (bot) {
                await sql.query('UPDATE users SET username = ? WHERE id = ?', [newName, bot.id]);
                console.log(`[MIGRATION] ✓ Renamed ${oldName} → ${newName}`);
            }
        }
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_ENTRY') {
            // Column/entry already exists, ignore
        } else {
            console.error('[MIGRATION] Error updating coinflip schema:', error.message);
        }
    }
}

async function start() {

    await Promise.all([
        cacheItems()
    ])

    // Run coinflip migration before caching
    await updateCoinflipSchemaOnStart();

    // Run Roblox account info migration
    try {
        const { addRobloxAccountInfo } = require('./database/add-roblox-account-info');
        await addRobloxAccountInfo();
    } catch (error) {
        console.error('Roblox account info migration failed:', error.message);
    }

    const promises = [
        cacheBets,
        cacheRains,
        cacheBattles,
        cacheCases,
        cacheDrops,
        cacheCrash,
        cacheCryptos,
        cacheWithdrawalCoins,
        cacheJackpot,
        cacheRoulette,
        cacheCoinflips,
        cacheChannels,
        cacheListings,
        cacheAdmin,
        cacheSlots,
        cacheSurveys,
        cacheLeaderboards
    ];

    await Promise.all(promises.map((p) => timedPromise(p(), p.name)));
    // console.log(results.map(e => `${e.name} completed in ${e.timeTaken}ms`));

    const port = process.env.PORT || 3000;

    const serverInstance = app.listen(port, () => {
        console.log('Listening on port ' + port);
    });
    
    require('./socketio');
    io.attach(serverInstance, { cors: { origin: '*' } });

}

function timedPromise(promise, name) {
    const startTime = Date.now();
    return promise.then(result => {
        const endTime = Date.now();
        console.log(`${name} completed in ${endTime - startTime}ms`);
        return { name, result, timeTaken: endTime - startTime };
    });
}

start();