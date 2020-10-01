# Messaging and Conversations

This covers the material that was presented as part of the Conversations sessions at the [2020 Twilio Signal SuperClass](https://signal.twilio.com/superclass). You can find more information at [signal.twilio.com](https://signal.twilio.com)

## Sending Messages with the Programmable SMS API

Check out the documentation [here](https://www.twilio.com/docs/sms/send-messages?code-sample=code-send-an-sms-message&code-language=Node.js&code-sdk-version=3.x). View the file [SendAMessage.js] or refer to the snippets below for sending the different types of messages.

### Sending from a number
```js
client.messages.create({
  to: "<Destinataion Number>",
  from: "<Source Number>",
  body: "<Message Body>" 
}).then(message => {
  console.log(`Woohoo! Your Message SID is ${message.sid}`);
}).catch(error => {
  console.error('Looks like the Twilio API returned an error:');
  console.error(error);
});
```

### Sending using an Alphanumeric ID
To send from an Alphanumeric ID replace the from number in the call to Twilio with the Alpha ID. To check of Alpha Sender IDs are support in your country refer to [here](https://support.twilio.com/hc/en-us/articles/223133767-International-support-for-Alphanumeric-Sender-ID?_ga=2.30746175.1682849377.1601252756-774449318.1583485530)


[Check out this blog for more info on Alphanumeric Sender IDs](https://www.twilio.com/blog/personalize-sms-alphanumeric-sender-id)

```js
client.messages.create({
  to: "<Destinataion Number>",
  from: "<Alphanumeric Sender ID>",
  body: "<Message Body>" 
}).then(message => {
  console.log(`Woohoo! Your Message SID is ${message.sid}`);
}).catch(error => {
  console.error('Looks like the Twilio API returned an error:');
  console.error(error);
});
```

### Sending from a Message Service
To send from a message service specify the message service SID in the from field. For more details on Message Services check out [this blog post](https://www.twilio.com/blog/twilio-messaging-service-copilot-features).

```js
client.messages.create({
  to: "<Destinataion Number>",
  from: "<Message Service SID>",
  body: "<Message Body>" 
}).then(message => {
  console.log(`Woohoo! Your Message SID is ${message.sid}`);
}).catch(error => {
  console.error('Looks like the Twilio API returned an error:');
  console.error(error);
});
```

## Responding to Messages
[Follow this tutorial for instructions.](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply)

The file I used in the session is [SMSStatusCallbacks.js].
Snippet below is Express Route for 
```js
// Create a route to handle incoming SMS messages
app.post('/sms', (request, response) => {
  console.log(
    `Incoming message from ${request.body.From}: ${request.body.Body}`
  );
  response.type('text/xml');
  // Edit the Below to Add a Status Callback.
  response.send(`
    <Response>
      <Message>Thanks for your message.</Message>
    </Response>

  `);
});

```

## Status Callbacks
To receive status callbacks for a message you send refer to the [documentation here](https://www.twilio.com/docs/sms/send-messages?code-sample=code-send-an-sms-message&code-language=Node.js&code-sdk-version=3.x#monitor-the-status-of-your-message)


To respond to a message and specify a status callback add an action parameter as shown below and point to an endpoint that can receive the callbacks.

```js
// Create a route to handle incoming SMS messages with status callback
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
```

## Conversations
Checkout Twilio Conversations [here](https://www.twilio.com/conversations-api). I ran through the [Conversations Quickstart](https://www.twilio.com/docs/conversations/quickstart).

### Conversations Extras

#### Adding a WhatsApp participant
To add a whatsapp partipant via the CLI use the below command.

```
twilio api:conversations:v1:conversations:participants:create \             
 --conversation-sid=CHXXXXX \
 --messaging-binding.address=whatsapp:<WhatsApp ID of recipient> \
 --messaging-binding.proxy-address=whatsapp:<Twilio registered WhatsApp SenderID>
```
For more information on using WhatsApp in conversations refer to [this guide](https://www.twilio.com/docs/conversations/using-whatsapp-conversations)

*Note:To add a Whatsapp participant to a conversation you need an approved WhatsApp Sender ID on your account. [More Information Here](https://www.twilio.com/docs/whatsapp/api). The Conversations API does not yet support using the Whatsapp Sandbox.*

#### Redacting messages from a Conversation
Redacting messages in conversations requires the use of Conversations Webhooks. [Please refer to the documentation for more info](https://www.twilio.com/docs/conversations/conversations-webhooks)

Below is the express route used to redact a credit card message using the onMessageAdd pre-event webhook
```js
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
```

#### Adding an Author
Snippet for pre-pending messages with the users name.
```js
// Create a route to handle incoming Preevent WebHooks
app.post('/preEvent', asyncHandler(async (request, response) => {
   let event = request.body;
   let eventType = event.EventType;
   console.log(
     `Incoming ${eventType}`
   );
   console.log(event);
  
   if (eventType == 'onMessageAdd') {
       // Demonstrating Prepending the User Name
       response.send({
         'body': `${event.Author} said: ${event.Body}`
       }); 
   };
}));
```
