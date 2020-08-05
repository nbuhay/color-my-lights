const config = require('config');
const assert = require('assert');
const expect = require('chai').expect;
const SpotifyAuthSvc = require('../../../services/SpotifyAuthSvc');
const nock = require('nock');
const querystring = require('querystring');
const https = require('https');
var sinon = require('sinon');
const { EventEmitter } = require('events');

describe('SpotifyAuthSvc', function () {

  afterEach('Restore sinon sandbox', function() {
    sinon.restore();
  });

  describe('#auth_code_flow_req_authz', function() {
    var fake_state;
    var scope;
    var res_data_mock;
    var redirect_uri;
    var query_params;
    var req_url;

    beforeEach('Setup required request data', function() {
      fake_state = 'abc123';
      scope = config.get('music_stream_provider.spotify.scope');
      res_data_mock = 'fake_data';

      // setup required query parms
      redirect_uri = 
        `${config.get('url')}:${config.get('port')}/auth/provider/callback/`;
      query_params = {
        client_id: config.get('music_stream_provider.spotify.client_id'),
        response_type: 'code',
        redirect_uri: redirect_uri,
        state: SpotifyAuthSvc.generate_oauth_state(),
        scope: scope,
        show_dialog: false
      };

      req_url =
        `https://${config.get('music_stream_provider.spotify.host')}`;
    });

    it('should exist', function() {
      expect(SpotifyAuthSvc.auth_code_flow_req_authz).to.exist;
    });

    it('should gen state using MusicStreamAuthSvc.generate_oauth_state', function() {
      let spy = sinon.spy(SpotifyAuthSvc, 'generate_oauth_state');

      return SpotifyAuthSvc.auth_code_flow_req_authz().then(() => {
        assert(spy.calledOnce);
      });
    });

    it('GET Spotify\'s authZ endpoint w/ required query parms', function() {
      // ensure state genereated from SpotifyAuthSvc.generate_oauth_state
      sinon.stub(SpotifyAuthSvc, 'generate_oauth_state').callsFake(() => {
        return fake_state;
      });
      query_params.state = SpotifyAuthSvc.generate_oauth_state();

      // stub call to Spotify with all setup data
      nock(req_url).get(`/authorize?${querystring.stringify(query_params)}`)
        .reply(200, res_data_mock);

      return SpotifyAuthSvc.auth_code_flow_req_authz()
        .then((data) => {
          assert.equal(data, res_data_mock);
        });
    });

    it('should return an Error when req throws an exception', function() {
      let error = new Error( `req error`);

      let https_throws = sinon.stub(https, 'request').throws(error);

      return SpotifyAuthSvc.auth_code_flow_req_authz()
        .then((data) => {
          expect(https_throws.calledOnce).to.be.true;
          expect(https_throws.calledTwice).to.be.false;
          expect(data).to.equal(error);
        });
          
    });

    it('should reject when req emits an error', function() {
      // ensure state genereated from SpotifyAuthSvc.generate_oauth_state
      sinon.stub(SpotifyAuthSvc, 'generate_oauth_state').callsFake(() => {
        return fake_state;
      });
      query_params.state = SpotifyAuthSvc.generate_oauth_state();

      let fake_error_msg = `test error`;


      // stub call to Spotify with all setup data
      nock(req_url).get(`/authorize?${querystring.stringify(query_params)}`)
        .replyWithError(fake_error_msg);

      return SpotifyAuthSvc.auth_code_flow_req_authz()
        .then((data) => {
          expect(data).to.equal(`request: Error: ${fake_error_msg}`);
        });
    });
    
    it('should verify the res state matches the req state');
    it('should return an Error when res state does not match req state');

  });

  describe('#auth_code_flow_req_tokens', function () {
    
    it('should exist', function () {
      assert(SpotifyAuthSvc.auth_code_flow_req_tokens);
    });

    it('should POST user auth code to Spotify auth host', function() {
      // user data to perform auth code flow
      const scope = config.get('music_stream_provider.spotify.scope');
      const fake_user_auth_code = 'some_fake_auth_code';
      const res_data_mock = JSON.stringify({
        "access_token": "NgCXRK...MzYjw",
        "token_type": "Bearer",
        "scope": scope,
        "expires_in": 3600,
        "refresh_token": "NgAagA...Um_SHo"
      });

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

      return SpotifyAuthSvc.auth_code_flow_req_tokens(fake_user_auth_code)
        .then((data) => {
          expect(data).to.equal(res_data_mock);
        });

    });

    it('should reject with error msg when reqs throw exceptions');

  });

});