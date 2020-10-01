const http = require('http');
const express = require('express');
const { urlencoded } = require('body-parser');
const ngrok = require('ngrok');
const twilio = require('twilio');
require('dotenv').config();

// Set up our express web application
const PORT = 8767;
const app = express();
app.use(urlencoded({ extended: false }));

// Create a route to handle incoming SMS messages
app.post('/sms', (request, response) => {
  console.log(
    `Incoming message from ${request.body.From}: ${request.body.Body}`
  );
  response.type('text/xml');
  // Edit the Below to Add a Status Callback.
  response.send(`
    <Response>
      <Message action="/status">Thanks for your message.</Message>
    </Response>
  `);
});

// Create a route to handle the status update
app.post('/status', request => {
  console.log('Status update received');
  console.log('Message status: ', request.body.MessageStatus);
  console.log('Message SID: ', request.body.MessageSid);
});

// Create and run an HTTP server which can handle incoming requests
const server = http.createServer(app);
server.listen(PORT, () =>
  console.log(`Express server listening on localhost:${PORT}`)
);

// -----------------------------------------------------------------------------
// This code sets up a tool called ngrok to let Twilio talk to the app running
// on your computer. It then uses the Twilio REST API to direct all incoming
// SMS messages to your local app. You should not have to edit any of this
// code below.
// -----------------------------------------------------------------------------

/* jshint ignore:start */
(async function() {
  try {
    await ngrok.disconnect();
    await ngrok.kill();
    let url = await ngrok.connect({
        proto: 'http', // http|tcp|tls, defaults to http
        addr: PORT, // port or network address, defaults to 80
        subdomain: 'toby', // reserved tunnel name https://alex.ngrok.io
        authtoken: process.env.NGROK_AUTH_TOKEN, // your authtoken from ngrok.com
      });
    console.log('ngrok forwarding configured - your app is live at ', url);

    let client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    let ngrokUrl = `${url}/sms`;
    let number = await client
      .incomingPhoneNumbers(process.env.TWILIO_NUMBER_SID)
      .update({
        smsUrl: ngrokUrl,
        smsMethod: 'POST',
      });
    console.log(
      `${number.phoneNumber} configured to send incoming SMS to ${ngrokUrl}`
    );
    console.log(
      `Send a message to ${
        number.phoneNumber
      } and check the reply you get back!`
    );
  } catch (e) {
    console.log('There was an error configuring incoming SMS:');
    console.log(e);
  }
})();
/* jshint ignore:end */
