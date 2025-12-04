const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendLog } = require('../../../utils');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'xp',
    description: 'Update user XP',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, username FROM users WHERE id = ?', [socket.userId]);
        
        if (executor.perms < 10) {
            return sendSystemMessage(socket, 'Insufficient permissions. Admin only.');
        }

        const targetUsername = args[0];
        const amount = parseInt(args[1]);

        if (!targetUsername || isNaN(amount) || amount === 0) {
            return sendSystemMessage(socket, 'Usage: /xp <user> <amount> (use negative for removal)');
        }

        try {
            const [[target]] = await sql.query('SELECT id, username, xp FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);

            if (!target) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            const newXp = Math.max(0, target.xp + amount);
            await sql.query('UPDATE users SET xp = ? WHERE id = ?', [newXp, target.id]);

            const action = amount > 0 ? 'added' : 'removed';
            const absAmount = Math.abs(amount);

            sendSystemMessage(socket, `✅ ${action} ${absAmount} XP ${amount > 0 ? 'to' : 'from'} @${target.username} (New: ${newXp} XP)`);
            sendLog('admin', `**${executor.username}** ${action} **${absAmount} XP** ${amount > 0 ? 'to' : 'from'} **${target.username}** (ID: \`${target.id}\`) - New XP: ${newXp}`);
            
            // Notify user
            io.to(target.id).emit('xp', newXp);
            io.to(target.id).emit('toast', 'info', `Your XP was updated: ${amount > 0 ? '+' : ''}${amount} XP`);

            // Discord log
            await sendDiscordLog('admin', {
                command: '/xp',
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
                    'Amount': `${amount > 0 ? '+' : ''}${amount} XP`,
                    'Previous XP': target.xp,
                    'New XP': newXp
                },
                result: `Successfully ${action} ${absAmount} XP ${amount > 0 ? 'to' : 'from'} ${target.username}`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error updating XP.');
        }
    }
};
