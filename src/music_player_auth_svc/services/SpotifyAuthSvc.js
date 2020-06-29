const config = require('config');
const https = require('https')
const MusicStreamAuthSvc = require('./MusicStreamAuthSvc');

class SpotifyAuthSvc extends MusicStreamAuthSvc {
  
  static authorize_code_flow (user_auth_code) {
    return new Promise((resolve, reject) => {

      let redirect_uri = 
        `${config.get('url')}:${config.get('port')}` +
        `/auth/provider/callback/`;
      let basic_auth = 
        `${config.get('music_stream_provider.spotify.client_id')}:` +
        `${config.get('music_stream_provider.spotify.secret_id')}`;

      // redirect_uri MUST match redirect_uri added at developer.spotify.com
      let post_data = JSON.stringify({
        'grant_type': 'authorization_code',
        'code': user_auth_code,
        'scope': SpotifyAuthSvc.generate_oauth_state(),
        'redirect_uri': redirect_uri
      });

      let options = {
        method: 'POST',
        hostname: config.get('music_stream_provider.spotify.host'),
        path: '/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basic_auth.toString('base64')}`,
          'Content-Length': Buffer.byteLength(post_data)
        }
      };

      let req = https.request(options, (res) => {
        let chunks = [];
        res
        .on('data', (chunk) => chunks.push(chunk))
        .on('end',  () => {
            resolve(Buffer.concat(chunks).toString())
          })
          .on('error', (error) => reject(`requestAuthPayload: ${error}`));

      });

      req.write(post_data);
      req.end();
    });
  }

}

module.exports = SpotifyAuthSvc;