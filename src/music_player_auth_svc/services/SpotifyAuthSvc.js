const config = require('config');
const https = require('https');
const querystring = require('querystring');
const MusicStreamAuthSvc = require('./MusicStreamAuthSvc');

class SpotifyAuthSvc extends MusicStreamAuthSvc {
  
  static auth_code_flow_req_tokens (user_auth_code) {
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
              resolve(Buffer.concat(chunks).toString());
            })
          .on('error', (e) => reject(`response: ${e}`));
        });

      req.write(post_data);
      req.end();
    });
  }

  static auth_code_flow_req_authz() {
    const req_oauth_state = SpotifyAuthSvc.generate_oauth_state();

    return new Promise((resolve, reject) => {
      let redirect_uri = 
        `${config.get('url')}:${config.get('port')}` +
          `/auth/provider/callback/`;

      let query_params =  {
        client_id: config.get('music_stream_provider.spotify.client_id'),
        response_type: 'code',
        redirect_uri: redirect_uri,
        state: req_oauth_state,
        scope: config.get('music_stream_provider.spotify.scope'),
        show_dialog: false
      };

      let options = {
        method: 'GET',
        hostname: config.get('music_stream_provider.spotify.host'),
        path: `/authorize?${querystring.stringify(query_params)}`
      };

      let req = https.request(options, (res) => {
        let chunks = [];
        res
          .on('error', (e) => reject(`response: ${e}`))
          .on('data', (chunk) => chunks.push(chunk))
          .on('end', () => {
            resolve(Buffer.concat(chunks).toString())
          });
      });

      req.on('error', (e) => reject(`request: ${e}`));
      req.end();
    }).catch((err) => { return err; });
  }

}

module.exports = SpotifyAuthSvc;