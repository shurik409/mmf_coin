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

bot.on('callback_query', (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const [type, count] = data.split(' ')
    console.log(type, count);
    if(type === 'add'){
        var qr_svg = qr.imageSync(`${type}-${count} `, { type: 'png' });
        bot.sendPhoto(chatId, qr_svg);
    }
    bot.sendMessage(chatId, `You ${msg.data} coin`);
});

bot.on('add5', (msg) => {
    const chatId = msg.chat.id;
    if(!msg.photo){
        var qr_svg = qr.imageSync(`$Add 5`, { type: 'png' });
        bot.sendPhoto(chatId, qr_svg);
        bot.sendMessage(chatId, 'You add 5 coin');
    }
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

// bot.on('')

var FileReader = require('filereader') , fileReader = new FileReader();

async function parseFile(chatId, file_path){
    console.log(file_path);
    fetch(`https://api.telegram.org/file/bot${token}/${file_path}`)
    .then(res => res.arrayBuffer())
    .then(async images => {
        // console.log(1111);
        // const img = await Jimp.read(images);
        // const qrReader = new QRReader();
        // console.log(2222);

        // const value = await new Promise((resolve, reject) => {
        //     console.log(3333);
        //     qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
        //     console.log(44444);
        //     qr.decode(img.bitmap);
        // });

        // console.log(55555);
        // console.log(value);

        Jimp.read(images, function(err, image) {
            qrReader.callback = function(err, value) {
                // console.log(value);
                if(value){
                    console.log('Result', value.result);
                    bot.sendMessage(chatId, value.result)
                } else {
                    bot.sendMessage(chatId, 'Pls make rephoto')
                }
            };
            // console.log(111);
            // image.getBase64("image/jpeg", (data) => console.log(data));
            qrReader.decode(image.bitmap);
        });
    })
}