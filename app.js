// Everything goes through the proxy,
// If user has cookie from django, it is authenticated, let it through, else,
// authenticate

const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('./passport-oauth2');
const app = express();
const http = require('http');
const httpProxy = require('http-proxy');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const port = 8080;

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

app.use(cookieParser());
app.use(session({
  secret: 'cern',
  resave: true,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000  // prune expired entries every 24h
  }),
}));

// USE OF BODY PARSER will make proxying of API unusuable (for POST and PUT):
// see https://github.com/chimurai/http-proxy-middleware/issues/299
// app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());  // Used to persist login sessions

passport.use(new OAuth2Strategy(
    {
      authorizationURL: process.env.authorizationURL ||
          'https://oauth.web.cern.ch/OAuth/Authorize',
      tokenURL: process.env.tokenURL || 'https://oauth.web.cern.ch/OAuth/Token',
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callbackURL,
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, profile);
    }));

// Used to stuff a piece of information into a cookie
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
  // If the user is authenticated in django (using custom auth, let it through)
  if (req.cookies.sessionid) {
    next();
  }
  if (req.user) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect('/callback');
  }
}

app.get(
    '/callback', passport.authenticate('oauth2', {
      failureRedirect: '/error',
    }),
    function(req, res) {
      res.redirect(req.session.returnTo || '/');
      delete req.session.returnTo;
    });

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(function() {
    res.clearCookie('connect.sid');
    res.redirect('https://login.cern.ch/adfs/ls/?wa=wsignout1.0');
  });
});
app.get('/error', (req, res) => {
  res.send('Error authenticating user');
});

// This proxy can also work with an API if provided the API_URL env. variable:
// Authentication will work normally for a browser that accesses the API, since
// it already has the session cookie. For API use, it will need to provide with
// all the cookies after OAUTH API requests (GET, POST, PUT, ...):
if (process.env.API_URL) {
  app.all('/api/*', isUserAuthenticated, (req, res) => {
    // Remove the api from url:
    const new_path = req.url.split('/api')[1];
    req.path = new_path;
    req.url = new_path;
    req.originalUrl = new_path;
    req.setTimeout(500000);
    res.setTimeout(500000);
    proxy.on('proxyReq', (proxyReq, req, res, options) => {
      const {user} = req;
      req.setTimeout(500000);
      res.setTimeout(500000);
      if (user) {
        proxyReq.setHeader('displayname', user.displayname);
        proxyReq.setHeader('egroups', user.egroups);
        proxyReq.setHeader('email', user.email);
        proxyReq.setHeader('id', user.id);
      }
    });
    proxy.web(req, res, {
      target: process.env.API_URL,
      timeout: long_timeout,
      proxyTimeout: long_timeout,
    });
  });
}

// keep only relevant groups
// https://twiki.cern.ch/twiki/bin/view/CMS/DQMRunRegistry2018#Authentication
function clean_egroups(egroups) {
  var egroups_answer = '';
  all_egroups = egroups.split(';');
  all_egroups.forEach(function(item, index) {
    if (item.includes('dqm')) egroups_answer += item + ';'
      if (item.includes('DQM')) egroups_answer += item + ';'
  });
  if (egroups_answer.length) egroups_answer = egroups_answer.slice(0, -1)
    return (egroups_answer)
};

// Client requests
app.all('*', isUserAuthenticated, (req, res) => {
  proxy.on('proxyReq', (proxyReq, req, res, options) => {
    req.setTimeout(500000);
    res.setTimeout(500000);
    const {user} = req;
    if (user) {
      user.egroups = clean_egroups(user.egroups);

      proxyReq.setHeader('displayname', user.displayname);
      proxyReq.setHeader('displayname', user.displayname);
      proxyReq.setHeader('egroups', user.egroups);
      proxyReq.setHeader('email', user.email);
      proxyReq.setHeader('id', user.id);

      // uncomment following for some logs printout
      if (process.env.enviroment == 'dev') {
        var timestamp = '[' + (new Date()).toLocaleString() + '] ';
        console.log(timestamp);
        console.log(user.displayname);
        console.log(user.email);
        console.log(user.egroups);
        console.log(user.id);
      };
    }
  });

  proxy.web(req, res, {
    target: process.env.CLIENT_URL,
  });
});

// If something goes wrong on either API or client:
proxy.on('error', function(err, req, res) {
  var timestamp = '[' + (new Date()).toLocaleString() + '] ';
  console.log(timestamp);
  console.log(err);
  try {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });

    res.end(`${err.message} ----------- ${JSON.stringify(err)}`);
  } catch (e) {
  }
});

server.listen(port, () => console.log(`OAUTH Proxy started on port ${port}`));
server.timeout = long_timeout;
