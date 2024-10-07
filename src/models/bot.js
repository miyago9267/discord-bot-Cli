const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

class Bot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                //   GatewayIntentBits.GuildVoiceStates,
            ],
        });

        this.prefix = '!';

        this.loadCogs();

        this.once('ready', () => {
            console.log(`Logged in as ${this.user.tag}`);
        });
    }

    loadCogs = () => {
        const cogsPath = path.join(__dirname, '../cogs');
        const cogFiles = fs.readdirSync(cogsPath).filter(file => file.endsWith('.js'));

        for (const file of cogFiles) {
            const Cog = require(path.join('../cogs', file));
            const cogInstance = new Cog(this);
            console.log(`已載入功能模組：${file}`);
        }
    }

}

module.exports = Bot;