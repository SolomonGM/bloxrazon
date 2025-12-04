const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'removepromo',
    description: 'Remove a promo code',
    async execute(socket, args) {

        const [[user]] = await sql.query('SELECT perms FROM users WHERE id = ?', [socket.userId]);
        
        if (user.perms < 10) {
            return sendSystemMessage(socket, 'Insufficient permissions. Admin only.');
        }

        const code = args[0];

        if (!code) {
            return sendSystemMessage(socket, 'Usage: /removepromo <code>');
        }

        try {
            const [result] = await sql.query('DELETE FROM promoCodes WHERE code = ?', [code]);
            
            if (result.affectedRows === 0) {
                return sendSystemMessage(socket, 'Promo code not found.');
            }

            sendSystemMessage(socket, `✅ Promo code "${code}" removed.`);

            // Discord log
            const [[executor]] = await sql.query('SELECT username, perms FROM users WHERE id = ?', [socket.userId]);
            await sendDiscordLog('admin', {
                command: '/removepromo',
                executor: {
                    id: socket.userId,
                    username: executor.username,
                    perms: executor.perms
                },
                details: {
                    'Code': code
                },
                result: `Promo code "${code}" deleted successfully`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error removing promo code.');
        }
    }
};
