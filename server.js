const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const http = require('http');
const httpProxy = require('http-proxy');
const PORT = 8080;

let keycloak_config = {
  //   'issuer': 'https://auth.cern.ch/auth/realms/cern',
  //   'authorization_endpoint':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/auth',
  //   'token_endpoint':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/token',
  //   'token_introspection_endpoint':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/token/introspect',
  //   'userinfo_endpoint':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/userinfo',
  //   'end_session_endpoint':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout',
  //   'jwks_uri':
  //       'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/certs',
  //   'realm-public-key':
  //       'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrVrCuTtArbgaZzL1hvh0xtL5mc7o0NqPVnYXkLvgcwiC3BjLGw1tGEGoJaXDuSaRllobm53JBhjx33UNv+5z/UMG4kytBWxheNVKnL6GgqlNabMaFfPLPCF8kAgKnsi79NMo+n6KnSY8YeUmec/p2vjO2NjsSAVcWEQMVhJ31LwIDAQAB',
  //   'auth-server-url': 'https://auth.cern.ch/auth',

  //   clientId: process.env.clientId,
  //   credentials: {secret: process.env.clientSecret},
  //   realm: 'cern',
  //   bearerOnly: true,
  //   serverUrl: process.env.CLIENT_URL
  'realm': 'cern',
  'auth-server-url': 'https://auth.cern.ch/auth',
  'ssl-required': 'external',
  'resource': process.env.clientID,
  'redirect-uri': process.env.callbackURL,
  'credentials': {'secret': process.env.clientSecret},
  'end_session_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout',
  'jwks_uri':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/certs',
};


const app = express();
const memoryStore = new session.MemoryStore({checkPeriod: 86400000});
const keycloak = new Keycloak({store: memoryStore}, keycloak_config);

const long_timeout = 2147483640;
const proxy = httpProxy.createProxyServer({
  timeout: long_timeout,
  proxyTimeout: long_timeout,
});

const server = http.createServer(app);
server.setTimeout(500000);
server.timeout = 100 * 60 * 1000;

server.on('upgrade', function(req, res, head) {
  proxy.ws(req, res, head, {target: process.env.API_URL});
});


// Configure session
app.use(session({
  secret: 'cern',
  resave: true,
  saveUninitialized: true,
  store: memoryStore
}));

// app.set('trust proxy', true);
app.use(keycloak.middleware({logout: '/logout'}));

// app.get('/logout', (req, res, next) => {
//   req.session.destroy(function() {
//     console.log('!!logging outttt');
//     // res.clearCookie('connect.sid');
//     res.redirect('');
//   });
// })
// app.get('/callback', , function(req, res, next) {
//   res.redirect(req.session.returnTo || '/');
//   delete req.session.returnTo;
// });


app.all('*', keycloak.protect(), (req, res, next) => {
  console.log(Object.keys(req));
  res.json({'message': true})
});

app.listen(PORT, function() {
  console.log(`App listening on port ${PORT}`);
});