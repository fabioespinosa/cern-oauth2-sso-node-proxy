const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('./passport-oauth2');
const app = express();
const port = 3000;

passport.use(
    new OAuth2Strategy({
        authorizationURL: 'http://oauth.web.cern.ch/OAuth/Authorize',
        tokenURL: 'http://oauth.web.cern.ch/OAuth/Token',
        clientID: 'cmsdqmrunregistry',
        clientSecret: 'fOR1Xy8gmrPZ0kxtTt05eIQbrwaUyPIZc0VXYh5cuWY1',
        callbackURL: 'https://cmsrunregistry.web.cern.ch'
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile);
    }
)
);

app.get('/', (req, res) => res.send('SSO Hello world'));
app.get(
    '/auth',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
        console.log('success');
        res.send('auth done');
    }
);
app.listen(port, () => console.log('SSO Hello world started'));
