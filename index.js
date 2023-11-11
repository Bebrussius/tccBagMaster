const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const path = require('path');

const client = new Client();
const app = express();
const port = 3000; // Escolha a porta que deseja usar

// Configuração do Express para lidar com solicitações POST
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

app.post('/send-message', (req, res) => {
    const { number, text } = req.body;

    // Ensure that the number starts with "55" for Brazil's country code
    let formattedNumber = number.startsWith('55') ? number : '55' + number;

    // Remove any non-numeric characters from the number
    formattedNumber = formattedNumber.replace(/\D/g, '');

    // Remove leading zeros from the area code (DDD)
    formattedNumber = formattedNumber.replace(/^0+/, '');

    // Add the "@c.us" suffix for WhatsApp Web
    const chatId = formattedNumber + '@c.us';

    // Sending message.
    client.sendMessage(chatId, text).then(() => {
        res.json({ status: 'success', message: 'Message sent successfully' });
    }).catch((error) => {
        res.json({ status: 'error', message: 'Error sending message', error: error.message });
    });
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
