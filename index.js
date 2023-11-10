const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, {small : true});
});

client.on('ready', () => {
    console.log('Client is ready!');
   
     // Number where you want to send the message.
    const number = "+555191378334";
   
     // Your message.
    const text = "Olá, Bernardo, como vai? Testando...";
   
     // Getting chatId from the number.
     // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
    const chatId = number.substring(1) + "@c.us";
   
    // Sending message.
    client.sendMessage(chatId, text);
   });

client.initialize();
