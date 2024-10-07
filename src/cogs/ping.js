class Ping {
    constructor(client) {
        this.client = client;

        this.client.on('messageCreate', message => {
            if (message.content === '!ping') {
                message.reply('哇操');
            }
        });
    }
}

module.exports = Ping;