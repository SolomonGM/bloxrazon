const { sendSystemMessage } = require('../functions');

module.exports = {
    name: 'help',
    description: 'Show available commands',
    async execute(socket, args) {

        // Get user perms to determine which commands to show
        const { sql } = require('../../../database');
        const [[user]] = await sql.query('SELECT perms FROM users WHERE id = ?', [socket.userId]);

        const commands = [
            '/help - Show this help message',
            '/balance [user] - Check your balance or another user\'s balance',
            '/tip <user> <amount> - Tip a user',
            '/rain <amount> - Start a rain (min R$5)',
            '/pls - Beg for coins (Begging channel only)',
            '/flex - Show off your balance (5min cooldown)',
            '/redeem <code> - Redeem a promo code',
        ];

        // Moderator commands (perms >= 5)
        if (user && user.perms >= 5) {
            commands.push('');
            commands.push('--- Moderator Commands ---');
            commands.push('/clear - Clear the chat');
            commands.push('/delete <user> <amount> - Delete user\'s past messages');
            commands.push('/lock - Lock the channel');
            commands.push('/unlock - Unlock the channel');
            commands.push('/mute <user> <duration> - Mute a user');
            commands.push('/unmute <user> - Unmute a user');
            commands.push('/ban <user> <reason> - Permanently ban a user');
            commands.push('/unban <user> - Unban a user');
            commands.push('/tempban <user> <hours> <reason> - Temporarily ban a user');
        }

        // Admin commands (perms >= 10) - Only shown to admins, NOT moderators
        if (user && user.perms >= 10) {
            commands.push('');
            commands.push('--- Admin Commands ---');
            commands.push('/permission <rank> <user> - Grant permissions (ranks: admin, manager, moderator, user)');
            commands.push('/balanceupdate <user> <amount> - Update user balance (use negative to remove)');
            commands.push('/xp <user> <amount> - Update user XP (use negative to remove)');
            commands.push('/promocode <amount> <code> <hours> - Create a promo code');
            commands.push('/removepromo <code> - Remove a promo code');
        }

        sendSystemMessage(socket, commands.join('\n'));

    }
}
