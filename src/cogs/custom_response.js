class ResponseCog {
    constructor(client) {
        this.client = client;

        this.responseMap = {
            "戳": "嗚哇><",
            "克里在嗎": "不在",
        }

        this.client.on('messageCreate', (ctx) => {
            if (ctx.author.bot) return;
            if (ctx.content in this.responseMap) {
                ctx.reply(this.responseMap[ctx.content]);
            }
        });
    }
}

module.exports = ResponseCog;