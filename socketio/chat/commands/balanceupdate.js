const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendLog, emitBalance } = require('../../../utils');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'balanceupdate',
    description: 'Update user balance',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, username FROM users WHERE id = ?', [socket.userId]);
        
        if (executor.perms < 10) {
            return sendSystemMessage(socket, 'Insufficient permissions. Admin only.');
        }

        const targetUsername = args[0];
        const amount = parseFloat(args[1]);

        if (!targetUsername || isNaN(amount) || amount === 0) {
            return sendSystemMessage(socket, 'Usage: /balanceupdate <user> <amount> (use negative for removal)');
        }

        try {
            const [[target]] = await sql.query('SELECT id, username, balance FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);

            if (!target) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            const newBalance = Math.max(0, target.balance + amount);
            await sql.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, target.id]);

            const action = amount > 0 ? 'added' : 'removed';
            const absAmount = Math.abs(amount);

            sendSystemMessage(socket, `✅ ${action} R$${absAmount} ${amount > 0 ? 'to' : 'from'} @${target.username}'s balance (New: R$${newBalance})`);
            sendLog('admin', `**${executor.username}** ${action} **R$${absAmount}** ${amount > 0 ? 'to' : 'from'} **${target.username}** (ID: \`${target.id}\`) - New balance: R$${newBalance}`);
            
            // Notify user
            emitBalance(target.id, 'set', newBalance);
            io.to(target.id).emit('toast', 'info', `Your balance was updated: ${amount > 0 ? '+' : ''}R$${amount}`);

            // Discord log
            await sendDiscordLog('admin', {
                command: '/balanceupdate',
                executor: {
                    id: socket.userId,
                    username: executor.username,
                    perms: executor.perms
                },
                target: {
                    id: target.id,
                    username: target.username
                },
                details: {
                    'Amount': `${amount > 0 ? '+' : ''}R$${amount}`,
                    'Previous Balance': `R$${target.balance}`,
                    'New Balance': `R$${newBalance}`
                },
                result: `Successfully ${action} R$${absAmount} ${amount > 0 ? 'to' : 'from'} ${target.username}`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error updating balance.');
        }
    }
};
