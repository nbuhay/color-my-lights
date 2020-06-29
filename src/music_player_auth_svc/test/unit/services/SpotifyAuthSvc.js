const config = require('config');
const assert = require('assert');
const expect = require('chai').expect;
const SpotifyAuthSvc = require('../../../services/SpotifyAuthSvc');
const nock = require('nock');
var sinon = require('sinon');

describe('SpotifyAuthSvc', function () {

  afterEach('Restore sinon sandbox', function() {
    sinon.restore();
  });

  describe('#authorize_code_flow', function () {
    
    it('should exist', function () {
      assert(SpotifyAuthSvc.authorize_code_flow);
    });

    it('should POST user data to Spotify auth host', function() {
      // user data to perform auth code flow
      let fake_user_auth_code = 'some_fake_auth_code';
      let fake_spotify_state = 'some_fake_spotify_state';
      let res_data_mock = {'data': 'dummy_data'};

      // ensure request state is generated using SpotifyAuthSvc
      sinon.stub(SpotifyAuthSvc, 'generate_oauth_state')
        .callsFake(() => fake_spotify_state);

      // setup payload body data
      let redirect_uri = 
        `${config.get('url')}:${config.get('port')}` +
        `/auth/provider/callback/`;
      let basic_auth = 
        `${config.get('music_stream_provider.spotify.client_id')}:` +
        `${config.get('music_stream_provider.spotify.secret_id')}`;
      let auth_flow_payload = JSON.stringify({
        'grant_type': 'authorization_code',
        'code': fake_user_auth_code,
        'scope': SpotifyAuthSvc.generate_oauth_state(),
        'redirect_uri': redirect_uri
      });
      let spotify_auth_flow_headers = {
        reqheaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basic_auth.toString('base64')}`,
          'Content-Length': Buffer.byteLength(auth_flow_payload)
        }
      };
    
      // stub call to Spotify with all setup data
      nock(`https://${config.get('music_stream_provider.spotify.host')}`, 
        spotify_auth_flow_headers)
          .post('/api/token', auth_flow_payload)
          .reply(200, res_data_mock);

      return SpotifyAuthSvc.authorize_code_flow(fake_user_auth_code)
        .then((data) => {
          expect(data).to.equal(JSON.stringify(res_data_mock));
        });

    });

  });

});