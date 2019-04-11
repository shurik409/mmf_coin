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

// replace the value below with the Telegram token you receive from @BotFather
const token = '802358275:AAF50V5R3lPrTrmkhVjYoI1O3wlOGu5lUpQ';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if(!msg.photo){
    var qr_svg = qr.imageSync(`${msg.text}`, { type: 'png' });
    bot.sendPhoto(chatId, qr_svg);
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
  }
});

bot.on('photo', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You send a photo');
    // bot.sendMessage(chatId, JSON.stringify(msg));
    // bot.sendPhoto(chatId, msg.photo[0].file_id);

    bot.getFile(msg.photo[0].file_id).then(data => parseFile(chatId, data.file_path));
})


var FileReader = require('filereader')
  , fileReader = new FileReader()
  ;

function parseFile(chatId, file_path){
    fetch(`https://api.telegram.org/file/bot${token}/${file_path}`)
    .then(res => res.arrayBuffer())
    .then(images => {
        console.log(images)
        // for(let a in images){
        //     console.log(a, '   ', images[a]);
        // }
        // let c = images.slice()
        // console.log(fileReader.readAsArrayBuffer(images));
        // var buffer = new Buffer(images, "binary");
        console.log(3333)
        Jimp.read(images, function(err, image) {
            console.log(1111)
            qrReader.callback = function(err, value) {
                console.log(2222)

                console.log('Result', value.result);
                bot.sendMessage(chatId, value.result)
                // console.log(value);
            };
            qrReader.decode(image.bitmap);
        });
        // toBuffer(c, (err, buffer) => console.log(buffer));
        // toBuffer(images,  function (err, buffer) {
        //     console.log(123123)
        //     
        //   })

    })




}