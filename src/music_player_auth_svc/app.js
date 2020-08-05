const express = require('express')
    , app = express()
    , api = require('./api')
    , https = require('https')
    , url = require('url')
    , querystring = require('querystring')
    , PORT = process.env.PORT || 8080
    , SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
    , SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
    , SPOTIFY_BASIC_AUTH = 
        new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

app.use('/', api);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));