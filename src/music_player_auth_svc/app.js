const http = require('http')
    , https = require('https')
    , url = require('url')
    , querystring = require('querystring')
    , HOSTNAME = '127.0.0.1'
    , PORT = process.env.PORT || 8080
    , SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
    , SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
    , SPOTIFY_BASIC_AUTH = 
        new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

const server = http.createServer((req, res) => {
  parseAuthCode(req)
    .then((auth_code) => requestAuthPayload(auth_code))
    .then((auth_payload) => getCurrentSong(auth_payload))
    .then((curr_song_data) => {
      res.end(curr_song_data)
    });
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

function parseAuthCode(req) {
  return new Promise((resolve, reject) => {
    let url_parts = url.parse(req.url, true)
      , query = url_parts.query;
    
    resolve(query.code);
  });
}

function requestAuthPayload(auth_code) {
  return new Promise((resolve, reject) => {
    
    
    var post_data = querystring.stringify({
      'grant_type': 'authorization_code',
      'code': auth_code,
      'redirect_uri': 'http://localhost:8080'
    });
    
    let options = {
      method: 'POST',
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${SPOTIFY_BASIC_AUTH.toString('base64')}`,
        'Content-Length': Buffer.byteLength(post_data)
      }
    };

    let req = https.request(options, (res) => {
      let chunks = [];
    
      res
        .on('data', (chunk) => chunks.push(chunk))
        .on('end',  () => resolve(Buffer.concat(chunks).toString()))
        .on('error', (error) => reject(`requestAuthPayload: ${error}`));

    });
    
    req.write(post_data);
    
  });
}

function getCurrentSong(auth_payload) {
  return new Promise((resolve, reject) => {
    let options = {
          method: 'GET',
          hostname: 'api.spotify.com',
          path: '/v1/me/player/currently-playing',
          headers: {
            Authorization: `Bearer ${JSON.parse(auth_payload).access_token}`
          }
        }
    , req = https.request(options, (res) => {
        let chunks = [];

        res
          .on('data', (chunk) => chunks.push(chunk))
          .on('end', () => resolve(Buffer.concat(chunks).toString()))
          .on('error', (error) => reject(`getCurrentSong: ${error}`));
    })
    console.log(options)
    req.end();
  });
}