const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');

module.exports = {
    name: 'balance',
    description: 'Check balance (yours or another user\'s)',
    async execute(socket, args) {

        const targetUsername = args[0];

        if (!targetUsername) {
            // Check own balance
            const [[user]] = await sql.query('SELECT balance FROM users WHERE id = ?', [socket.userId]);
            return sendSystemMessage(socket, `Your balance is R$${user.balance}.`);
        }

        // Check another user's balance
        const [[targetUser]] = await sql.query('SELECT id, username, balance, hideBalance FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1', [targetUsername]);
        
        if (!targetUser) {
            return sendSystemMessage(socket, `User @${targetUsername} not found.`);
        }

        if (targetUser.hideBalance && targetUser.id !== socket.userId) {
            return sendSystemMessage(socket, `@${targetUser.username} has their balance hidden.`);
        }

        sendSystemMessage(socket, `@${targetUser.username}'s balance is R$${targetUser.balance}.`);

    }
}