const fs = require('fs');
const express = require('express');
const https = require('https');

const app = express();

const port = 3000;

const privateKey = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');

const server_options = {
    key: privateKey,
    cert: certificate
};

app.get('/', (req, res) => res.send('SSO Hello world'));
const https_server = https.createServer(server_options, app);
https_server.listen(port, () => console.log('SSO Hello world started'));
