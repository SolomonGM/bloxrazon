const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'promocode',
    description: 'Create a promo code',
    async execute(socket, args) {

        const [[user]] = await sql.query('SELECT perms, superAdmin FROM users WHERE id = ?', [socket.userId]);
        
        if (user.perms < 10) {
            return sendSystemMessage(socket, 'Insufficient permissions. Admin only.');
        }

        const amount = parseFloat(args[0]);
        const code = args[1];
        const hours = parseInt(args[2]);

        if (!amount || isNaN(amount) || amount <= 0) {
            return sendSystemMessage(socket, 'Usage: /promocode <amount> <code> <hours>');
        }

        if (!code || code.length < 3 || code.length > 50) {
            return sendSystemMessage(socket, 'Code must be 3-50 characters.');
        }

        if (!hours || isNaN(hours) || hours <= 0) {
            return sendSystemMessage(socket, 'Invalid time limit in hours.');
        }

        try {
            const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
            
            await sql.query(
                'INSERT INTO promoCodes (code, amount, createdBy, expiresAt) VALUES (?, ?, ?, ?)',
                [code, amount, socket.userId, expiresAt]
            );

            sendSystemMessage(socket, `✅ Promo code "${code}" created: R$${amount} - Expires in ${hours}h`);

            // Discord log
            const [[executor]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
            await sendDiscordLog('admin', {
                command: '/promocode',
                executor: {
                    id: socket.userId,
                    username: executor.username,
                    perms: executor.perms
                },
                details: {
                    'Code': code,
                    'Amount': `R$${amount}`,
                    'Duration': `${hours} hours`,
                    'Expires At': expiresAt.toISOString()
                },
                result: `Promo code "${code}" created successfully`
            });
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return sendSystemMessage(socket, 'Promo code already exists.');
            }
            console.error(e);
            sendSystemMessage(socket, 'Error creating promo code.');
        }
    }
};
