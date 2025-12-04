const mysql = require('mysql2/promise');

// Parse Railway's MYSQL_URL if available, otherwise use individual env vars
let connection;
if (process.env.MYSQL_URL) {
    const url = new URL(process.env.MYSQL_URL);
    connection = {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        database: url.pathname.slice(1), // Remove leading slash
        password: url.password,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        typeCast: function (field, next) {
            if (field.type == "NEWDECIMAL") {
                const value = field.string();
                return (value === null) ? null : Number(value);
            }
            return next();
        }
    };
} else {
    connection = {
        host: process.env.SQL_HOST || 'localhost',
        port: process.env.SQL_PORT || 3306,
        user: process.env.SQL_USER,
        database: process.env.SQL_DB,
        password: process.env.SQL_PASS,
        ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        typeCast: function (field, next) {
            if (field.type == "NEWDECIMAL") {
                const value = field.string();
                return (value === null) ? null : Number(value);
            }
            return next();
        }
    };
}

const pool = mysql.createPool(connection);

// Test database connection on startup
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✓ Database connected successfully');
        conn.release();
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        console.error('Connection config:', {
            host: connection.host,
            port: connection.port,
            user: connection.user,
            database: connection.database,
            ssl: !!connection.ssl
        });
    }
})();

// pool.on('connection', function (connection) {
//     console.log('Connection established');
// });

// pool.on('acquire', function (connection) {
//     console.log('Connection %d acquired', connection.threadId);
// });

// pool.on('release', function (connection) {
//     console.log('Connection %d released', connection.threadId);
// });

// pool.on('enqueue', function () {
//     console.log('Waiting for available connection slot');
// });

// pool.on('error', function (err) {
//     console.error('Pool error', err);
// });

async function doTransaction(transactionLogic) {

    const connection = await pool.getConnection();
    // if (!connection) throw new Error('Could not get connection from pool.');

    let hasEnded = false;

    async function commit() {
        if (hasEnded) throw new Error('Transaction has already been committed or rolled back.');
        const [commitResult] = await connection.commit();
        if (commitResult && commitResult.warningStatus) {
            throw new Error('Commit err: ' + commitResult.warningStatus);
        }
        hasEnded = true;
    }

    async function rollback() {
        if (hasEnded) throw new Error('Transaction has already been committed or rolled back.');
        try {
            const [rollbackResult] = await connection.rollback();
            if (rollbackResult && rollbackResult.warningStatus) {
                throw new Error('Rollback err: ' + rollbackResult.warningStatus);
            }
        } catch (err) {
            // If connection is closed, ignore the rollback error
            if (err.code !== 'PROTOCOL_CONNECTION_LOST' && !err.message?.includes('closed state')) {
                throw err;
            }
        }
        hasEnded = true;
    }

    try {

        const [txResult] = await connection.beginTransaction();
        if (txResult && txResult.warningStatus) {
            throw new Error('Transaction err: ' + txResult.warningStatus);
        }

        const res = await transactionLogic(connection, commit, rollback);

        if (!hasEnded) await rollback();
        return res;
        
    } catch (err) {
        if (!hasEnded) {
            try {
                await rollback();
            } catch (rollbackErr) {
                // Log but don't throw if rollback fails due to closed connection
                if (rollbackErr.code !== 'PROTOCOL_CONNECTION_LOST' && !rollbackErr.message?.includes('closed state')) {
                    console.error('Rollback error:', rollbackErr);
                }
            }
        }
        throw err;
    } finally {
        try {
            connection.release();
        } catch (releaseErr) {
            // Ignore release errors for closed connections
            console.error('Connection release error:', releaseErr);
        }
    }
}

module.exports = {
    sql: pool,
    doTransaction
};