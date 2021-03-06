const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const schema = require('enigma.js/schemas/12.20.0.json');

const engineHost = '20.126.68.16';
const enginePort = 4747;
const appId = 'engineData';
const userDirectory = 'motor';
const userId = 'luke';

// Path to a local folder containing the Sense Enterprise exported certificates:
const certificatesPath = './certificates';

// Helper function to read the contents of the certificate files:
const readCert = (filename) => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));

const session = enigma.create({
  schema,
  url: `wss://${engineHost}:${enginePort}/app/${appId}`,
  // Notice the non-standard second parameter here, this is how you pass in
  // additional configuration to the 'ws' npm library, if you use a different
  // library you may configure this differently:
  createSocket: (url) => new WebSocket(url, {
    ca: [readCert('root.pem')],
    key: readCert('client_key.pem'),
    cert: readCert('client.pem'),
    headers: {
      'X-Qlik-User': `UserDirectory=${encodeURIComponent(userDirectory)}; UserId=${encodeURIComponent(userId)}`,
    },
  }),
});

session.open().then((global) => {
  console.log('Session was opened successfully');
  return global.getDocList().then((list) => {
    const apps = list.map((app) => `${app.qDocId} (${app.qTitle || 'No title'})`).join(', ');
    console.log(`Apps on this Engine that the configured user can open: ${apps}`);
    session.close();
  });
}).catch((error) => {
  console.log('Failed to open session and/or retrieve the app list:', error);
  process.exit(1);
});