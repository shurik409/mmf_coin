const mongodbClient = require('./mongodb')


const TelegramBot = require('node-telegram-bot-api');
const qr = require('qr-image');
const Jimp = require("jimp");
const fs = require('fs');
const fetch = require('node-fetch');
var QrCode = require('qrcode-reader');
var qrReader = new QrCode();
var Blob = require('blob');
var Buffer = require('buffer/').Buffer;
var toBuffer = require('blob-to-buffer')

const token = '802358275:AAF50V5R3lPrTrmkhVjYoI1O3wlOGu5lUpQ';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    
    // bot.editMessageReplyMarkup({
    //     keyboard: [[test]]
    // })
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
    // console.log(msg);
    // bot.
    balance = await mongodbClient.getBalance(chatId);
    console.log(3, balance);
    bot.sendMessage(chatId, `Your balance: ${balance.balance}`);
})

bot.on('callback_query', (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const [type, count] = data.split(' ')
    console.log(type, count);
    if(type === 'add'){
        var qr_svg = qr.imageSync(`${type}-${count}`, { type: 'png' });
        bot.sendPhoto(chatId, qr_svg);
    } else if(type === 'minus'){
        var qr_svg = qr.imageSync(`${type}-${count}`, { type: 'png' });
        bot.sendPhoto(chatId, qr_svg);
    }
    bot.sendMessage(chatId, `You ${msg.data} coin`);
});

bot.on('photo', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You send a photo');
    // bot.sendMessage(chatId, JSON.stringify(msg));
    // bot.sendPhoto(chatId, msg.photo[0].file_id);
    console.log(msg.photo);
    console.log(msg.photo.length);
    bot.getFile(msg.photo[msg.photo.length - 1].file_id).then(data => parseFile(chatId, data.file_path));
})



async function parseFile(chatId, file_path){
    console.log(file_path);
    console.log(`http://api.qrserver.com/v1/read-qr-code/?fileurl=https://api.telegram.org/file/bot${token}/${file_path}`);
    fetch(`http://api.qrserver.com/v1/read-qr-code/?fileurl=https://api.telegram.org/file/bot${token}/${file_path}`)
        .then(data => data.json())
        .then(data => console.log(data));
    // .then(res => res.arrayBuffer())
    // .then(async images => {
    //     Jimp.read(images, function(err, image) {
    //         qrReader.callback = function(err, value) {
    //             console.log(value);
    //             if(value){
    //                 console.log('Result', value.result);
    //                 fromQrResult(chatId, value.result);
    //                 bot.sendMessage(chatId, value.result)
    //             } else {
    //                 bot.sendMessage(chatId, 'Pls make rephoto')
    //             }
    //         };
    //         qrReader.decode(image.bitmap);
    //     });
    // })
}

async function fromQrResult(chatId, result) {
    const [type, count] = result.split('-');
    if(type === 'add'){
        mongodbClient.addToBalance(chatId, parseInt(count));
    } else if(type === 'minus'){
        mongodbClient.addToBalance(chatId, -parseInt(count));
    }
}