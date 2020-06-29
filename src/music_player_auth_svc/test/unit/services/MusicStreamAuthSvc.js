const MusicStreamAuthSvc = 
        require('../../../services/MusicStreamAuthSvc')
const assert = require('assert'); 

describe('MusicStreamAuthSvc', function () {

  describe('#generate_oauth_state', function () {
   
    it('should exist', function() {
      assert(MusicStreamAuthSvc.generate_oauth_state);
    });

    it('should return a string', function() {
      assert.equal(
        typeof MusicStreamAuthSvc.generate_oauth_state(),
        'string');
    });

    it('should return a string 12 characters long', function() {
      const OAUTH_STATE_STRING_LENGTH = 12;

      assert.equal(
        MusicStreamAuthSvc.generate_oauth_state().length,
        OAUTH_STATE_STRING_LENGTH);
    });
    
    it('should return a unique string each time', function() {
      const NUM_ASSERTION_TESTS = 10000; // check uniqueness this many times
      let assertion_runs = 0;

      for(; assertion_runs < NUM_ASSERTION_TESTS; assertion_runs++) {
        assert.notEqual(
          MusicStreamAuthSvc.generate_oauth_state(),
          MusicStreamAuthSvc.generate_oauth_state()
        );
      }
      
    });

  });

  describe('#authorize_code_flow', function() {

    it('should exist', function() {
      assert(MusicStreamAuthSvc.authorize_code_flow());
    })
  });

});