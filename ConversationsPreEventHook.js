const http = require('http');
const express = require('express');
const asyncHandler = require('express-async-handler')
const { urlencoded } = require('body-parser');
const ngrok = require('ngrok');
const twilio = require('twilio');
require('dotenv').config();

// Set up our express web application
const PORT = 8767;
const app = express();
app.use(urlencoded({ extended: false }));

// Create a route to handle incoming Preevent WebHooks
app.post('/preEvent', asyncHandler(async (request, response) => {
    let event = request.body;
    let eventType = event.EventType;
    console.log(
      `Incoming ${eventType}`
    );
    console.log(event);
    
    if (eventType == 'onMessageAdd') {
      // Demonstrate Redaction
      // Regex for a Credit card like number.
      var checkCredit = RegExp('([0-9- ]{15,16})');
      if (checkCredit.test(event.Body)) {
        console.log('Detected a Credit Card');

       //Respond to the message.
       response.send({
           'body': 'A credit card was redacted.',
           'author': 'Chief Compliance Bot'
       });

      }

    };
}));


// Create a route to handle the status update
app.post('/status', request => {
  console.log('Status update received');

  console.log('Message Service status: ', request.body.MessageStatus);
  console.log('Message Service SID: ', request.body.MessageSid);
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
    let ngrokUrl = `${url}/preEvent`;
    

    console.log(
      `Start a Conversation Now.`
    );

  } catch (e) {
    console.log('There was an error configuring incoming SMS:');
    console.log(e);
  }
})();
/* jshint ignore:end */
