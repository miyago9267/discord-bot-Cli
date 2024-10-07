class Gacha {
    constructor(client) {
        this.client = client;

        this.init();

        this.client.on('messageCreate', async (ctx) => {
            if (ctx.author.bot) return;

            if (this.pityCount[ctx.author.id] == undefined) {
                this.pityCount[ctx.author.id] = 0;
            }

            if (ctx.content === '十連') {
                await this.roll(ctx, 10);
            }
        });
    }

    init = () => {
        this.pityCount = {};
        this.gachaChances = {
            'UR': 4,
            'SSR': 14,
            'SR': 114,
            'R': 1000
        }

        this.tinyPityChances = {
            'UR': 4,
            'SSR': 14,
            'SR': 1000
        }

        this.pityMax = 300;
    }

    roll = async (ctx, count) => {
        let rolls = [], curGachaCount = this.pityCount[ctx.author.id];;
        for (let i = 0; i < count; i++) {
            this.pityCount[ctx.author.id]++;
            let card = this.deal(ctx, this.gachaChances), pity = this.pityCheck(ctx);
            rolls.push(pity? pity : card);
        }
        if (count == 10 && rolls.every(card => card == 'R')) rolls[9] = this.deal(ctx, this.tinyPityChances);
        await ctx.channel.send(`累計抽卡: ${Math.min(curGachaCount+count, 300)}/${this.pityMax}\n${rolls.join(", ")}`);
    }

    deal = (ctx, chances) => {
        let rng = Math.floor(Math.random() * 1000) + 1;
        let cumulativeChance = 0;

        for (const [card, chance] of Object.entries(chances)) {
            cumulativeChance += chance;
            if (rng < cumulativeChance) {
                return card;
            }
        }
    }

    pityCheck = (ctx) => {
        const user = ctx.author.id;
        if (this.pityCount[user]>=this.pityMax) {
            this.pityCount[user] = 0;
            return 'UR';
        }
        return null;
    }
}

module.exports = Gacha;