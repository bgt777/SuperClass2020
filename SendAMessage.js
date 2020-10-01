// Here, we load Twilio's helper library for Node.js
const twilio = require('twilio');
require('dotenv').config();

// Next we create an authenticated API client with the account credentials
// you configured earlier. TwilioQuest makes these configuration properties
// available as system environment variables in your code
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Here, we use our API client to make a request to the Twilio
// REST API. Substitute your own mobile number and message body below, and
// watch what happens when you press play!
client.messages.create({
  to: "<Destination number>",
  from: "<Source Number>",
  body: "<Message Body>" 
}).then(message => {
  console.log(`Woohoo! Your Message SID is ${message.sid}`);
}).catch(error => {
  console.error('Looks like the Twilio API returned an error:');
  console.error(error);
});
