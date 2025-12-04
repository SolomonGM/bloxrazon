const { sql } = require('../../../database');
const { sendSystemMessage } = require('../functions');
const io = require('../../server');
const { sendDiscordLog } = require('../../../utils/discord-logger');

module.exports = {
    name: 'permission',
    description: 'Grant permissions to a user',
    async execute(socket, args) {

        const [[executor]] = await sql.query('SELECT perms, superAdmin, role FROM users WHERE id = ?', [socket.userId]);
        
        // Permission hierarchy check
        const executorLevel = executor.superAdmin ? 100 : executor.perms;
        
        if (executorLevel < 5) {
            return sendSystemMessage(socket, 'Insufficient permissions.');
        }

        const rank = args[0]?.toLowerCase();
        const targetUsername = args[1];

        if (!rank || !targetUsername) {
            return sendSystemMessage(socket, 'Usage: /permission <rank> <user>\nRanks: admin, manager, moderator, user');
        }

        // Define rank values
        const ranks = {
            'user': { role: 'user', perms: 0 },
            'moderator': { role: 'moderator', perms: 5 },
            'manager': { role: 'manager', perms: 8 },
            'admin': { role: 'admin', perms: 10 }
        };

        if (!ranks[rank]) {
            return sendSystemMessage(socket, 'Invalid rank. Use: admin, manager, moderator, or user');
        }

        const targetRank = ranks[rank];

        // Permission checks based on executor level
        if (rank === 'admin' && executorLevel < 10) {
            return sendSystemMessage(socket, 'Only admins can grant admin rank.');
        }

        if (rank === 'manager' && executorLevel < 10) {
            return sendSystemMessage(socket, 'Only admins can grant manager rank.');
        }

        if (rank === 'moderator' && executorLevel < 8) {
            return sendSystemMessage(socket, 'You need manager or admin rank to grant moderator.');
        }

        try {
            const [[target]] = await sql.query('SELECT id, username, superAdmin, perms FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername]);

            if (!target) {
                return sendSystemMessage(socket, `User @${targetUsername} not found.`);
            }

            if (target.superAdmin) {
                return sendSystemMessage(socket, 'Cannot modify super admin permissions.');
            }

            if (target.perms >= executorLevel && target.id !== socket.userId) {
                return sendSystemMessage(socket, 'Cannot modify users with equal or higher permissions.');
            }

            await sql.query('UPDATE users SET role = ?, perms = ? WHERE id = ?', [targetRank.role, targetRank.perms, target.id]);

            sendSystemMessage(socket, `✅ @${target.username} is now ${rank} (perms: ${targetRank.perms})`);
            
            // Notify target user
            io.to(target.id).emit('toast', 'info', `Your rank has been updated to ${rank.toUpperCase()}`);

            // Discord log
            const [[executorData]] = await sql.query('SELECT username FROM users WHERE id = ?', [socket.userId]);
            await sendDiscordLog('admin', {
                command: '/permission',
                executor: {
                    id: socket.userId,
                    username: executorData.username,
                    perms: executorLevel
                },
                target: {
                    id: target.id,
                    username: target.username
                },
                details: {
                    'New Rank': rank,
                    'New Perms': targetRank.perms,
                    'Previous Perms': target.perms
                },
                result: `Successfully updated ${target.username} to ${rank}`
            });
        } catch (e) {
            console.error(e);
            sendSystemMessage(socket, 'Error updating permissions.');
        }
    }
};
