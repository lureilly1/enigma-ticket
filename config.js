const https = require('https');
const fs = require('fs');

const xrfKey = 'abcdefghijklmnop';

module.exports = {
  // Your Sense Enterprise installation hostname
  host: 'motor.westeurope.cloudapp.azure.com', //'20.126.68.16',
  // Listening port of the Qlik Sense Enterprise proxy
  proxyPort: 4243,
  // Name of virtualProxy to be used (begin with '/')
  virtualProxy: '/motor-ticket',
  // 'engineData' is a special "app id" that indicates you only want to use the global
  appId: 'engineData',
  // The Sense Enterprise-configured user directory for the user you want to identify as:
  userDirectory: 'motor',
  // The user to use when creating the session:
  userId: 'luke',
  xrfKey: xrfKey,
  // URL to the QPS there the ticket is retrived
  ticketURL() { return `https://${this.host}:${this.proxyPort}/qps${this.virtualProxy}/ticket?xrfkey=${xrfKey}`; },
  // Body sent in the ticket request
  ticketReqBody() {
    return {
      UserDirectory: this.userDirectory,
      UserId: this.userId,
      Attributes: [],
      TargetId: '',
    };
  },
  // Config used for the ticket request
  ticketReqConfig: {
    headers: {
      'Content-Type': 'application/json',
      'X-Qlik-Xrfkey': xrfKey,
    },
    httpsAgent: new https.Agent({
      ca: [fs.readFileSync('./certificates/root.pem')],
      key: fs.readFileSync('./certificates/client_key.pem'),
      cert: fs.readFileSync('./certificates/client.pem'),
      rejectUnauthorized: false,
      // passphrase: "secret",
    }),
  },
};
