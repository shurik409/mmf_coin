const mongodbClient = require('./mongodb')

const TelegramBot = require('node-telegram-bot-api');
const qr = require('qr-image');
const fetch = require('node-fetch');

const token = '802358275:AAF50V5R3lPrTrmkhVjYoI1O3wlOGu5lUpQ';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, 'Create balance', {
        reply_markup: {
            inline_keyboard : [[
            {
                text: 'Add 5',
                callback_data: 'add 5'
            },{
                text: 'Add 10',
                callback_data: 'add 10'
            },{
                text: 'Add 15',
                callback_data: 'add 15'
            },{
                text: 'Minus 5',
                callback_data: 'minus 5'
            }
        ]]
        }
    });
});

bot.onText(/\/balance/, async (msg, match) => {
    const chatId = msg.chat.id;
    balance = await mongodbClient.getBalance(chatId, msg.from);
    console.log(3, balance);
    bot.sendMessage(chatId, `Your balance: ${balance.balance}`);
})

bot.on('callback_query', async (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const [type, count] = data.split(' ')
    console.log(type, count);
    let qrCode = await mongodbClient.addQrCode(type === 'minus' ? `-${count}` : count, msg.from);
    console.log(qrCode);
    var qr_svg = qr.imageSync(`${qrCode.id}`, { type: 'png' });
    bot.sendPhoto(chatId, qr_svg);
    bot.sendMessage(chatId, `You ${msg.data} coin`);
});

bot.on('photo', (msg) => {
    const chatId = msg.chat.id;
    bot.getFile(msg.photo[msg.photo.length - 1].file_id).then(data => parseFile(chatId, data.file_path, msg));
})

async function parseFile(chatId, file_path, msg){
    console.log(file_path);
    console.log(`http://api.qrserver.com/v1/read-qr-code/?fileurl=https://api.telegram.org/file/bot${token}/${file_path}`);
    fetch(`http://api.qrserver.com/v1/read-qr-code/?fileurl=https://api.telegram.org/file/bot${token}/${file_path}`)
        .then(data => data.json())
        .then(data => {
            if(data[0].symbol[0].data){
                value = data[0].symbol[0].data;
                console.log('Result', value);
                fromQrResult(chatId, value, msg);
            }
        });
}

async function fromQrResult(chatId, result, msg) {
    let queryResult = await mongodbClient.addToBalance(chatId, result, msg.from);
    if(queryResult.added){
        bot.sendMessage(chatId, `${queryResult.addedValue} успешно добавленно на ваш баланс`);
    } else{
        bot.sendMessage(chatId, queryResult.text);
    }
}