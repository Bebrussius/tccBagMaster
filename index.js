require('dotenv').config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.messages.create({
  from: 'whatsapp:+14155238886',
  body: 'Olá',
  to: 'whatsapp:+555191378334',
}).then(message => console.log(message.sid));