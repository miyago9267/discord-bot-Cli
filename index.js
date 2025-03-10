// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    //   GatewayIntentBits.GuildVoiceStates,
    ],
  });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 隨機數字(最小,最大)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (message.content === "hello") {
        message.channel.send("嗨");
    } else if (message.content === "戳") {
        if (message.author.bot) return;
        message.channel.send("嗚哇><");
    } else if (message.content === "嗚哇><") {
        message.channel.send("？我沒戳你");
    } 
})

client.on(Events.MessageCreate,(message) => {
    if (message.content === "克里在嗎") {
        let p = getRandomInt(1,2);
        // console.log(p);
        if (p == 1){
            message.channel.send(`不在`);
        } else {
            message.channel.send(`我在喔:3`);
        }
    }
})

// 隨機
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    const reRandom = /隨機/.test(message);
    const reDie = /死/.test(message);
    if (reRandom !== true) return;

    let arr = message.content.split(" ");
    if ((arr[0]) !== "隨機") return;

    if (reDie == true){
        message.channel.send(`還沒死透`);
    } else{
        let p = getRandomInt(1, (arr.length - 1));
        if (arr[p] == undefined) {
            message.channel.send(`你沒放選項`);
        } else {
            message.channel.send(`${arr[p]}`);
        }
    }
})

// 因數
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    const reFactor = /因數/.test(message);
    if (reFactor == false) return;
    
    let num = message.content.split(" ");
    if ((num[0]) !== "因數") return;

    let fac = num[1];
    let factor = [];

    for(let i = 1; i <= (num[1]); i++){
        if (((num[1]) % fac) == 0){
            factor.push(` ${fac}`);
            fac -= 1;
        } else {
            fac -= 1;
        }
    }
    if ((factor.length) == 2){
        message.channel.send(`${num[1]} 的因數有 [${factor} ]   這是質數`);
    } else{
        message.channel.send(`${num[1]} 的因數有 [${factor} ]`);
    }
})

client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (message.content === "單抽"|message.content === "抽卡") {
        let gachaResult = getRandomInt(1, 100)
        if (gachaResult > 98){
            message.reply(`SSR`);
        } else if (gachaResult < 89){
            message.reply(`R  ${gachaResult}`);
        } else {
            message.reply(`SR`);
        }
    };
})

client.on(Events.MessageCreate,(message) => {
    if (message.content === "十連") {
    if (message.author.bot) return;

    let gachaArr = [];
    let Guarantee = 0;
    for (let i = 1; i <= 10; i++){
        let gachaResult = getRandomInt(1, 100)
        
        if (gachaResult > 98){
            gachaArr.push(` SSR`);
        } else if (gachaResult < 89){
            gachaArr.push(` R`);
            Guarantee += 1;
        } else {
            gachaArr.push(` SR`);
        }
    }
    if (Guarantee == 10){
        gachaArr[9] = ` SR`;
    }
    message.reply(`${gachaArr} `);
}})

/* ------------------------------------------------------------------------- */
// 用來記錄哪些用戶已經輸入了 'a'
/*
const userHasSentA = new Set();

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return;

    // 當用戶輸入 'a' 時
    if (message.content === 'a') {
        userHasSentA.add(message.author.id);  // 記錄用戶已經輸入了 'a'
        message.reply('You have triggered part A. Now, send B.');
    }
    
    // 當用戶輸入 'b' 時，檢查是否已經輸入過 'a'
    else if (message.content === 'b') {
        if (userHasSentA.has(message.author.id)) {
            message.reply('You have now triggered part B! Here is the response C.');
            userHasSentA.delete(message.author.id);  // 完成後重置狀態
        } else {
            message.reply('You need to send A first.');
        }
    }
});
*/



/* ------------------------------------------------------------------------- */

// godfield simple

let godFieldActive = false;
const godfieldUsers = new Set();

// 教典
const itemList = require('./godField.json')
const catagories = ["weapons", "armor", "sundries"]

// 回合 用戶HP 克里HP
let GF = 1;
let userHp = 10;
let CLiHp = 10;

let userTurn = true; //true: 玩家攻擊 false: 玩家防禦

// 手牌
let userItemsDescription = []
let userItemsEffect = []
let CLiItemsDescription = []
let CLiItemsEffect = []

// 計算傷害
let damage = 0;

// 顯示血量
function showHp(message){
    message.channel.send(`> G.F. ${GF}/100\n> HP ${userHp}    ${message.author.username}\n> HP ${CLiHp}    CLi`);
}

// 發牌
function dealCard (arrDescription, arrEffect){
    let deal = [getRandomInt(0,5)]
    deal.push(getRandomInt(0, (5 - deal[0])))
    deal.push(5 - deal[0] - deal[1])
    let idx = 0
    for (i = 0; i <3; i++){
        for (a = 0; a < deal[i]; a++){
            let p = getRandomInt(0,4)
            arrDescription.push(`  \`${itemList[catagories[idx]][p]["name"]}(${itemList[catagories[idx]][p]["description"]})\``)
            arrEffect.push(itemList[catagories[idx]][p]["effect"])
        }
        idx += 1;
}}

// 神界開局
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (message.content !== "神界") return;
    // 防止重新開局
    // if (godFieldActive == true) return;

    if (message.author.username.indexOf(godfieldUsers) < 0){
        godfieldUsers.add(message.author.username);
    }
    godFieldActive = true;
    // message.channel.send(`${message.author.username} 誕生`);
    // message.channel.send(`預言者們的戰鬥現在開始`);
    // message.channel.send(`> G.F. ${GF}/100\n> HP${userHp}    ${message.author.username}\n> HP${CLiHp}    CLi`);

    // reset Game
    userItemsDescription = [];
    userItemsEffect = [];
    CLiItemsDescription = [];
    CLiItemsEffect = [] ;
    GF = 1;
    userHp = 10;
    CLiHp = 10;

    // 玩家發牌
    dealCard(userItemsDescription,userItemsEffect);
    userItemsDescription.unshift(`\`祈禱\``)
    userItemsEffect.unshift("祈禱")
    userItemsDescription.push(`\`攻5預設\``)
    userItemsEffect.push(+5)

    // 克里發牌
    dealCard(CLiItemsDescription,CLiItemsEffect);
    CLiItemsDescription.unshift("\`祈禱\`")
    CLiItemsEffect.unshift("0")
    // CLiItemsDescription.push(` \`HP1預設\``)
    // CLiItemsEffect.push("hp1")

    message.channel.send(`${userItemsDescription}`);
    message.channel.send(`CLi手牌 >  ${CLiItemsDescription}`);
    message.channel.send(`${message.author.username}的回合 >`);
})

// 找最接近
function findClosestIndex(damage) {
    let closestIndex = 0;
    let minDiff = Math.abs(CLiItemsEffect[0] - damage);
  
    for (let i = 1; i < CLiItemsEffect.length; i++) {
      let diff = Math.abs(CLiItemsEffect[i] - damage);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
}

// 使用後刪掉手牌
function spliceCard(deleteCardIndex,arrDescription,arrEffect){
    arrDescription.splice(deleteCardIndex,1)
    arrEffect.splice(deleteCardIndex,1)
}

// 克里防禦
function CliDefend(message){
    const reDef = /-/.test(CLiItemsEffect)
    if (reDef == true){
        damage -= damage*2
        let defi = parseInt(findClosestIndex(damage));
        if (defi == 0){
            // 不防禦
            message.channel.send(`CLi受到傷害 >  ${damage}`);
            CLiHp -= damage;
        }else{
            // 防禦
            damage -= CLiItemsEffect[defi]
            message.channel.send(`CLi防禦 >  ${CLiItemsDescription[defi]}`);
            spliceCard(defi, CLiItemsDescription, CLiItemsEffect);
            CLiHp += damage;
        }
    } else {
        // 沒防具
        message.channel.send(`CLi受到傷害 >  ${damage}`);
        CLiHp -= damage;
    }
    damage = 0;
    showHp(message);
    message.channel.send(`CLi的回合 >`);

    // 昇天
    if (CLiHp < 1){
        message.channel.send(`CLi昇天 > 遊戲結束\n贏家 > ${message.author.username}`);
        godFieldActive = false;
    }
}

// 克里攻擊
function CLiAttack(message) {
    const reHP = /hp/.test(CLiItemsEffect)
    const reAtk = /[+]/.test(CLiItemsEffect)
    damage = 0;
    if (reHP == true){
        // 克里+hp
        const CLiHPfilter = CLiItemsEffect
            .filter(item => typeof item === 'string' && item.startsWith('hp')) // 過濾出包含 'a' 的值
            .sort((a, b) => parseInt(b.slice(1)) - parseInt(a.slice(1)))[0];  // 依照後面的數字排序並取得最大值;
        const CLiHPIndex = CLiItemsEffect.findIndex(item => item === CLiHPfilter);
        message.channel.send(`CLi使用 >  ${CLiItemsDescription[CLiHPIndex]}`);
        CLiHp += parseInt(CLiItemsEffect[CLiHPIndex].replace("hp", ""));
        spliceCard(CLiHPIndex, CLiItemsDescription, CLiItemsEffect);
        GF += 1;
        showHp(message);
        message.channel.send(`${message.author.username}的回合 >`);
    } else if (reHP == false && reAtk == true){
        // 克里攻擊
        const CLiAtkIndex = parseInt(findClosestIndex(5));
        message.channel.send(`CLi攻擊 >  ${CLiItemsDescription[CLiAtkIndex]}`);
        damage += parseInt(CLiItemsEffect[CLiAtkIndex])
        spliceCard(CLiAtkIndex, CLiItemsDescription, CLiItemsEffect);
        userTurn = false;
    } else {
        // 克里祈禱
        let idx = getRandomInt(0,2)
        let p = getRandomInt(0,4)
        CLiItemsDescription.push(`  \`${itemList[catagories[idx]][p]["name"]}(${itemList[catagories[idx]][p]["description"]})\``)
        CLiItemsEffect.push(itemList[catagories[idx]][p]["effect"])
        message.channel.send(`CLi祈禱 >  獲得 ${CLiItemsDescription[CLiItemsDescription.length - 1]}`);

        if (CLiItemsDescription.length > 16){
            let discard = getRandomInt(1,15);
            console.log(`丟棄 >  ${userItemsDescription[discard]}`)
            CLiItemsDescription.splice(discard, 1);
            CLiItemsEffect.splice(discard, 1);
        }
        GF += 1;
        message.channel.send(`CLi手牌 > ${CLiItemsDescription}`);
        message.channel.send(`${message.author.username}的回合 >`);
    }
}
 
// 玩家攻擊
function playerAttact (message) {
    // if (userTurn != true) return;
    const rePlay = /\d\b/.test(message);
    if (rePlay != true) return;
    
    // 祈禱
    if (message.content == "0"){
        let idx = getRandomInt(0,2)
        let p = getRandomInt(0,4)
        userItemsDescription.push(`  \`${itemList[catagories[idx]][p]["name"]}(${itemList[catagories[idx]][p]["description"]})\``)
        userItemsEffect.push(itemList[catagories[idx]][p]["effect"])
        message.channel.send(`${message.author.username}祈禱 >  獲得 ${userItemsDescription[userItemsDescription.length - 1]}`);

        // 手牌超過15張(不含祈禱) 
        if (userItemsDescription.length > 16){
            let discard = getRandomInt(1,15);
            message.channel.send(`${message.author.username}自動丟棄 >  ${userItemsDescription[discard]}`);
                userItemsDescription.splice(discard, 1);
                userItemsEffect.splice(discard, 1);
            }

        message.channel.send(`${message.author.username}目前手牌 >  ${userItemsDescription}`);
        GF += 1;
        CLiAttack(message);
        return;
    } 

    // 出牌
    if (message.content > (userItemsDescription.length - 1)) return;
    let p = message.content;
    damage = 0;

    const reHPe = /hp/.test(userItemsEffect[p]);
    if (reHPe == true){
        // 使用雜貨
        message.channel.send(`${message.author.username}使用 >  ${userItemsDescription[p]}`);
        userHp += parseInt(userItemsEffect[p].replace("hp", ""));
        showHp(message);
        // spliceCard(p, userItemsDescription, userItemsEffect);
        GF += 1;
        CLiAttack(message);
    } else if (userItemsEffect[p] < 0){
        // 使用防具(不可行)
        message.channel.send(`請使用武器 / 雜貨 / 祈禱`);
    } else if (reHPe != true){
        // 攻擊
        damage += parseInt(userItemsEffect[p]);
        message.channel.send(`${message.author.username}攻擊 >  ${userItemsDescription[p]}`);
        // spliceCard(p, userItemsDescription, userItemsEffect);
        CliDefend(message);
        GF += 1;
        CLiAttack(message);
    }    
    // 正式版要記得刪手牌 然抽新的
}

function playerDefend (message) {
    if (userTurn == true) return;
    const rePlay = /\d\b/.test(message);
    if (rePlay != true) return;
    // 玩家防禦 還沒寫qwq
}

// 玩家出牌
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (godFieldActive != true) return;
    playerAttact(message);
})

// 顯示手牌
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (godFieldActive != true) return;

    if (message.content === "手牌"){
        message.channel.send(`${message.author.username}的手牌 >  ${userItemsDescription}`);
    }
})

// 中途結束神界
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (godFieldActive != true) return;
    if (message.content === "結束"){
        godFieldActive = false;
        console.log("close godField")
    }
})

client.login(token);