class Random {
    constructor(client) {
        this.client = client;

        this.client.on('messageCreate', async (ctx) => {
            if (ctx.author.bot) return;

            if (ctx.content.startsWith('隨機 ')) {
                let choices = ctx.content.split(' ');
                await ctx.channel.send(this.choice(choices));
            }
        });
    }

    choice = (list) => {
        let randomIndex = Math.floor(Math.random() * (list.length -1)) + 1;
        return list[randomIndex];
    }
}

module.exports = Random;