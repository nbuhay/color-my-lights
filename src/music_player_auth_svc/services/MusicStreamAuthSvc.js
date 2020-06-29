class MusicStreamAuthSvc {

  static authorize_code_flow() {
    return 'not_yet_implemented'
  }

  static generate_oauth_state() {
    return Math.random().toString(36).repeat(2).substring(2,14);
  }

}

module.exports = MusicStreamAuthSvc;