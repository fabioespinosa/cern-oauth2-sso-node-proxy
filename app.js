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
            clientID: 'cms-runregistry',
            clientSecret: 'h00FZSTyBjlalYKp7GqdBZQP2heMeaqLnpSNiTNXvcc1',
            callbackURL: 'https://cmsrunregistry.web.cern.ch/callback'
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(accessToken);
            console.log(refreshToken);
            console.log(profile);

            cb();
        }
    )
);

app.get('/', (req, res) => {
    console.log('get /');
    res.send('SSO Hello world');
});
app.get(
    '/callback',
    passport.authenticate('oauth2', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log('success');
        res.redirect('/protected');
    }
);

app.get('/protected', res.send('made it'));

app.listen(port, () => console.log('SSO Hello world started'));
