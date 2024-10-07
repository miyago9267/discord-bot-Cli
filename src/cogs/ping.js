class Ping {
    constructor(client) {
        this.client = client;

        this.client.on('messageCreate', async (ctx) => {
            if (ctx.author.bot) return;
            if (ctx.content === '!ping') {
                ctx.reply('PONG');
            }
        });
    }
}

module.exports = Ping;