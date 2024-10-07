class Factor {
    constructor(client) {
        this.client = client;

        this.client.on('messageCreate', async (ctx) => {
            if (ctx.author.bot) return;
            if (ctx.content.startsWith('因數')) {
                const number = parseInt(ctx.content.split(' ')[1]);
                if (!isNaN(number)) {
                    const factors = await this.factor(number);
                    await ctx.reply(`${number}的因數有:\n${factors.join(', ')}`);
                }
            }
        });
    }

    factor = async (number) => {
        let factors = [];
        for (let i = 1; i <= number; i++) {
            if (number % i === 0) {
                factors.push(i);
            }
        }
        return factors;
    }
}

module.exports = Factor;