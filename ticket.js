const axios = require('axios');
const enigma = require('enigma.js');
const WebSocket = require('ws');

const schema = require('enigma.js/schemas/12.20.0.json');
const config = require('./config');

let possibleEnigmaErr;

(async () => {
  // Retrieve the requestTicket
  const { data } = await axios.post(config.ticketURL(), config.ticketReqBody(), config.ticketReqConfig);

  //console.log('DATA: ',data.ticket)
 
  // Do this before calling `new WebSocket` on the client server (not the websocket server).
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

   // Create a enigma session
  const session = enigma.create({
    schema,
    url: `https://${config.host}${config.virtualProxy}/app/${config.appId}?QlikTicket=${data.Ticket}`,
    createSocket: (url) => new WebSocket(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Qlik-Xrfkey': config.xrfKey,
        'X-Qlik-User': `UserDirectory=${encodeURIComponent(config.userDirectory)}; UserId=${encodeURIComponent(config.userId)}`,
      },
    }),
  });

  // Catch possible errors sent on WebSocket
  session.on('traffic:received', (res) => {
    console.log('ws: ',res)
    if (res.params && res.params.severity === 'fatal') {
      possibleEnigmaErr = res.params.message;
    }
  });

  console.log(`Connecting to ${session.config.url}`);

  // Connect to the engine and retrieve the global
  const global = await session.open();
  console.log(global)
})().catch((err) => {
  if (err.enigmaError) {
    console.error('Enigma error:', possibleEnigmaErr || err);
  } else {
    console.log('Error',err);
  }
});
