const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('SSO Hello world'));
app.listen(port, () => console.log('SSO Hello world started'));
