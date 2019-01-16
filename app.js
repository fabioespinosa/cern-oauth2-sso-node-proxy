const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('./passport-oauth2');
const app = express();
const port = 3000;

passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: 'https://oauth.web.cern.ch/OAuth/Authorize',
            tokenURL: 'https://oauth.web.cern.ch/OAuth/Token',
            clientID: 'cmsdqmrunregistry',
            clientSecret: 'fOR1Xy8gmrPZ0kxtTt05eIQbrwaUyPIZc0VXYh5cuWY1',
            callbackURL: 'https://cmsrunregistry.web.cern.ch/callback'
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(accessToken);
            console.log(refreshToken);
            console.log(profile);
            cb('hello', 'hello');
        }
    )
);

app.get('/', (req, res) => {
    console.log('get /');
    res.send('SSO Hello world');
});
app.get(
    '/auth',
    passport.authenticate('oauth2', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log('success');
        res.redirect('/');
    }
);
app.get('/callback', (req, res) => {
    console.log(req);
    console.log(res);
});

app.post('/callback', (req, res) => {
    console.log(req);
    console.log(res);
});
app.listen(port, () => console.log('SSO Hello world started'));
