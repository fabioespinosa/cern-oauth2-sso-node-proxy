require('dotenv').config()
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const port = process.env.SERVER_PORT || 8080;

let keycloak_config = {
  'realm': 'cern',
  'auth-server-url': 'https://auth.cern.ch/auth',
  'ssl-required': 'external',
  'resource': process.env.CLIENT_ID,
  //   'redirect_uri': process.env.CALLBACK_URL,
  'credentials': {'secret': process.env.CLIENT_SECRET},
  'issuer': 'https://auth.cern.ch/auth/realms/cern',
  'authorization_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/auth',
  'token_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/token',
  'token_introspection_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/token/introspect',
  'userinfo_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/userinfo',
  'end_session_endpoint':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout',
  'jwks_uri':
      'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/certs',
};



const app = express();
const memoryStore = new session.MemoryStore({checkPeriod: 86400000});
const keycloak = new Keycloak({store: memoryStore}, keycloak_config);

// Configure session
app.use(session({
  secret: 'cern',
  resave: true,
  saveUninitialized: true,
  store: memoryStore
}));

// app.set('trust proxy', true);

// This automatically adds a "/logout" endpoint which
// will take care of the logout automatically.
app.use(keycloak.middleware({logout: '/logout'}));

app.get(
    '/', keycloak.protect(),
    (req, res, next) => {res.json({'message': 'Welcome to /'})});

app.use('*', keycloak.protect(), (req, res, next) => {
  const {
    kauth: {
      grant:
          {access_token: {content: {cern_roles, name, cern_person_id, email}}}
    }
  } = req;
  console.log('!!!!!!!!!!!!!!!!!!! Info');
  console.log(`Name: ${name}`);
  console.log(`Roles: ${cern_roles}`);
  console.log(`email: ${email}`);
  console.log(`Id: ${cern_person_id}`);
  console.log(`Redirect to:`, req.session.auth_redirect_uri);
  res.redirect(req.originalUrl || '/');
  // res.json({'client': Object.keys(req)});
});


app.listen(port, function() {
  console.log(`App listening on port ${port}`);
});