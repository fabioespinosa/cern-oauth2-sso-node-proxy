const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');


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
  'realm-public-key':
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrVrCuTtArbgaZzL1hvh0xtL5mc7o0NqPVnYXkLvgcwiC3BjLGw1tGEGoJaXDuSaRllobm53JBhjx33UNv+5z/UMG4kytBWxheNVKnL6GgqlNabMaFfPLPCF8kAgKnsi79NMo+n6KnSY8YeUmec/p2vjO2NjsSAVcWEQMVhJ31LwIDAQAB',
  'auth-server-url': 'https://auth.cern.ch/auth',
  'ssl-required': 'external',
  'resource': process.env.clientID,
  'public-client': true,
};



const memoryStore = new session.MemoryStore({checkPeriod: 86400000});

const keycloak = new Keycloak({store: memoryStore}, keycloak_config);


const app = express();
// Configure session
app.use(session({
  secret: 'cern',
  resave: true,
  saveUninitialized: true,
  store: memoryStore
}));

// app.set('trust proxy', true);
app.use(keycloak.middleware());

app.listen(3000, function() {
  console.log('App listening on port 3000');
});

app.get(
    '/', keycloak.protect(), (req, res, next) => {res.json({status: 'ok'})});
