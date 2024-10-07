const itemList = require('../static/godField.json')
const specialCard = require('../static/special.json')

class Godfield {
    constructor(client) {
        this.client = client;

        this.godfieldActive = false;

        this.client.on('messageCreate', async (ctx) => {
            if (ctx.author.bot) return;
            if (this.godfieldActive) {
                // message.channel.send("遊戲正在進行中");
                // return;
            }

            if (ctx.content === "神界") {
                console.log("神界開始");
                this.godfieldActive = true;
                this.start(ctx);
            }

            if (this.godfieldActive && ctx.content !== "神界") {

                if (!/^\d+$/.test(ctx.content)) {
                    if (ctx.content === "!showInv") {
                        await this.showInv(ctx, ctx.author.username);
                    }
                    return;
                } else {
                    let cardIndex = ctx.content;
                    console.log(cardIndex);
                    if (this.defenseBuffer['waitDefense'])
                        await this.play(ctx, 'CLi', ctx.author.username);
                    else
                        await this.play(ctx, ctx.author.username, 'CLi');
                }

            }

        });
    }

    start = async (ctx) => {
        this.init();

        this.HP[ctx.author.username] = 10;
        this.HP['CLi'] = 10;
        this.handCard[ctx.author.username] = this.deal(5);

        // 除錯用 直接給一把神劍
        this.handCard[ctx.author.username].push({
            "name": "神劍",
            "effect": "+30",
            "description": "攻30",
            "type": "weapon"
        })
        this.handCard['CLi'] = this.deal(5);

        this.GF++;
        this.turn = ctx.author.username;

        await ctx.channel.send(`## 預言者們的戰鬥現在開始！`);
        await this.message(ctx, '', ctx.author.username);
    }

    // 初始化狀態
    init = () => {
        this.HP = {};
        this.handCard = {};
        this.GF = 0;
        this.turn = '';
        this.waitDefense = false;
        this.damageCache = 0;
        this.defenseBuffer = {};
    }

    // 抽卡 回傳一個陣列
    deal = (count) => {
        let items = []
        for (let i = 0; i < count; i++) {
            let index = Math.floor(Math.random() * itemList.length);
            items.push(itemList[index]);
        }
        return items;
    }

    // 主功能part
    play = async (ctx, from, to) => {
        let cardIndex, card;

        // 如果是機器人就隨意出一張卡
        if (from === 'CLi' && !this.defenseBuffer['waitDefense']){
            let nonArmorIndexes = this.handCard['CLi']
                .map((item, index) => item.type !== 'armor' ? index + 1 : null)
                .filter(index => index !== null);
            nonArmorIndexes.unshift(0);
            cardIndex = nonArmorIndexes[Math.floor(Math.random() * nonArmorIndexes.length)];
        }
        else
            cardIndex = parseInt(ctx.content);

        // 為0則祈禱 否則轉為array index
        // 如果同時正在等待防禦 則判定為放棄
        if (cardIndex == 0){
            if (this.defenseBuffer['waitDefense'])
                card = specialCard.find(card => card.name === "放棄");
            else
                card = specialCard.find(card => card.name === "祈禱");
        }
        else {
            if (this.defenseBuffer['waitDefense'])
                card = this.handCard[to][cardIndex - 1];
            else
                card = this.handCard[from][cardIndex - 1];
        }

        // 罐頭訊息
        await ctx.channel.send(`${this.defenseBuffer['waitDefense']?to:from}使用了${card.name}`);
        console.log(card);

        // 出牌判斷
        // 祈禱 啥都不幹
        if (card.type == "pray") {
            await this.pray(ctx, from, to);
        }
        // 武器 攻擊
        else if (card.type === "weapon") {
            if (this.defenseBuffer['waitDefense']) {
                await ctx.reply("你現在應該防禦");
                await this.waitDefenseMessage(ctx, from, to);
                return;
            }
            await this.attack(ctx, card, from, to);
        }
        // 防具 防禦 判定正在等待防禦才作用
        else if (card.type === "armor") {
            // console.log(this.defenseBuffer['waitDefense'])
            if (!this.defenseBuffer['waitDefense']) {
                await ctx.reply("你不能現在使用防禦卡");
                await this.message(ctx, from, to);
                return;
            }
            await this.attackHit(ctx, card, from, to);
        }
        // 道具 補血
        else if (card.type === "sundries") {
            if (this.defenseBuffer['waitDefense']) {
                await ctx.reply("你現在應該防禦");
                await this.waitDefenseMessage(ctx, from, to);
                return;
            }
            await this.sundries(ctx, card, from, to);
        }

        // 正在等待防禦的時候不要往下做
        if (this.defenseBuffer['waitDefense']) return;

        // 判定死亡
        const deadPlayers = Object.entries(this.HP)
        .filter(([key, value]) => value <= 0)
        .map(([key, value]) => key);
        if (deadPlayers.length > 0) {
            await ctx.channel.send(`${deadPlayers.join(', ')}昇天 > 遊戲結束`);
            console.log(deadPlayers);
            this.init();
            this.godfieldActive = false;
            return;
        }

        // 移除用掉的卡、抽新卡及回合輪替
        if (card.type !== "pray")
            this.handCard[from].splice(cardIndex+1, 1);
        this.GF++;

        let newCard = this.deal(1)[0];
        await ctx.channel.send(`> ${from}獲得了${newCard.name}`);
        this.handCard[from].push(newCard);
        await this.message(ctx, from, to);


        // 球權換人
        if (this.turn === ctx.author.username) {
            this.turn = 'CLi';
            this.play(ctx, 'CLi', ctx.author.username);
        } else if (!this.defenseBuffer['waitDefense']) {
            this.turn = ctx.author.username;
        }
    }

    // 祈禱 啥都不幹
    pray = async (ctx, from, to) => {
        console.log(`${from}祈禱`);
    }

    // 攻擊
    attack = async (ctx, card, from, to) => {
        console.log("攻擊");
        this.defenseBuffer = {
            'waitDefense': true,
            'damage': card.effect,
            'from': from,
            'to': to
        };

        // 如果現在是玩家的回合 代表被打的是機器人
        // 就讓機器人隨機選一張防具
        if (this.turn === ctx.author.username) {
            // cardIndex = Math.floor(Math.random() * this.handCard['CLi'].length);
            let idx = 0;
            let tmpInv = this.handCard['CLi'].slice(0);
            tmpInv.unshift(specialCard.find(tmpcard => tmpcard.name === "放棄"));
            let armorIndexes = tmpInv
                .map((item, index) => item.type === 'armor' ? index : null)
                .filter(index => index !== null);
            idx = armorIndexes[Math.floor(Math.random() * armorIndexes.length)];
            console.log("防禦使用：", tmpInv[idx])

            await ctx.channel.send(`CLi使用了${tmpInv[idx].name}`);
            await this.attackHit(ctx, tmpInv[idx], from, to);
            return;
        }

        await this.waitDefenseMessage(ctx, from, to);
    }

    // 執行攻擊命中 結算傷害
    attackHit = async (ctx, card, from, to) => {
        console.log("攻擊命中");
        let damage = this.defense(ctx, card, from, to);
        this.HP[to] = Math.max(eval(this.HP[to] - damage), 0);
        await ctx.channel.send(`${from}攻擊了${to}造成${damage}點傷害`);
        await ctx.channel.send(`${to}血量： ${this.HP[to]>=0?this.HP[to]:0}`);
        this.defenseBuffer = {};
    }

    // 執行防禦 傷害計算
    defense = (ctx, card, from, to) => {
        console.log("防禦");
        let damage = this.defenseBuffer['damage'];
        console.log(damage, card.effect);
        let trueDamage = Math.max(eval(damage + card.effect), 0);
        return trueDamage;
    }

    // 補血
    sundries = async (ctx, card, from, to) => {
        console.log(`${from}使用道具`);
        let heal = parseInt(card.effect.match(/^hp(\d+)$/)[1]);
        this.HP[from] = eval(this.HP[from] + heal);
        await ctx.channel.send(`${from}補充了${heal}點HP`);
    }

    // 等待防禦時的輸出訊息
    waitDefenseMessage = async (ctx, from, to) => {
        let tmpInv = this.handCard[ctx.author.username].slice(0);
        tmpInv.unshift(specialCard.find(tmpcard => tmpcard.name === "放棄"));

        await ctx.channel.send(`${to}請選擇防禦`);
        await ctx.channel.send(`> 當前手牌 >  ${tmpInv.map((item, key) => `(${key}): \`${item.name}(${item.description})\``).join(', ')}\n`);

    }

    // 統一輸出訊息
    message = async (ctx, from, to) => {
        let message = "";
        let tmpInv = this.handCard[ctx.author.username].slice(0);
        if (this.defenseBuffer['waitDefense']) {
            tmpInv.unshift(specialCard.find(card => card.name === "放棄"));
        } else {
            tmpInv.unshift(specialCard.find(card => card.name === "祈禱"));
        }
        message += `## G.F. ${this.GF}/100\n`;
        message += `> 你的手牌 >  ${tmpInv.map((item, key) => `(${key}): \`${item.name}(${item.description})\``).join(', ')}\n`;
        message += `> 當前血量： ${this.HP[ctx.author.username]}\n`;
        message += `> CLi手牌 >  ${this.handCard['CLi'].map((item, key) => `(${key + 1}): \`${item.name}(${item.description})\``).join(', ')}\n`;
        message += `> 克里血量： ${this.HP['CLi']}\n`;
        message += `${to}的回合 >`;
        await ctx.channel.send(message);
    }

    // 除錯用 顯示當前庫存卡片
    showInv = async (ctx, username) => {
        let tmpInv = this.handCard[username].slice(0);
        await ctx.reply(`你的手牌 > \n${tmpInv.map((item, key) => `${key + 1}. \`${item.name}(${item.description})\``).join('\n')}\n`);
    }

}

module.exports = Godfield;