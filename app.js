const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('./passport-oauth2');
const app = express();
const http = require('http');
const httpProxy = require('http-proxy');
const port = 3000;

const proxy = httpProxy.createProxyServer({});

app.use(passport.initialize());
passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: 'https://oauth.web.cern.ch/OAuth/Authorize',
            tokenURL: 'https://oauth.web.cern.ch/OAuth/Token',
            clientID: 'cms-runregistry',
            clientSecret: 'h00FZSTyBjlalYKp7GqdBZQP2heMeaqLnpSNiTNXvcc1',
            callbackURL: 'https://cmsrunregistry.web.cern.ch/callback'
        },
        function(accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken;
            console.log('profile', profile);
            done(null, profile);
        }
    )
);

app.get(
    '/callback',
    passport.authenticate('oauth2', {
        failureRedirect: '/error',
        session: false
    }),
    function(req, res) {
        console.log(req.user.displayName);
        console.log(req.headers);
        res.redirect('/secret');
    }
);
app.get('/error', (req, res) => {
    res.send('Error authenticating user');
});

app.get(
    '/secret',
    passport.authenticate('oauth2', { session: false }),
    (req, res) => {
        res.send('this is secret and everything worked');
    }
);

// app.get('*', passport.authenticate('oauth2'), (req, res) => {
//     console.log('hola');
//     res.send('it works');
//     // proxy.web(req, res, {
//     //     target: 'http://cms-rr-prod.cern.ch:7001'
//     // });
// });

app.listen(port, () => console.log('SSO Hello world started'));
