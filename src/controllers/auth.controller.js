const { BadRequest } = require('http-errors');
const AuthService = require('../services/auth.service.js');

const authService = new AuthService();

class AuthController {
  discordAuthUrl(req, res) {
    const url = authService.getDiscordAuthorizationUrl();
    res.send({ url });
  }

  async discordLogin(req, res) {
    const { code } = req.body;
    const authToken = await authService.discordLogin(code);
    res.send({ message: 'Successfully logged in with discord', authToken });
  }

  googleClientId(req, res) {
    const clientId = authService.getGoogleClientId();
    res.send({ clientId });
  }

  async googleLogin(req, res) {
    const { code } = req.body;
    const authToken = await authService.googleLogin(code);
    res.send({ message: 'Successfully logged in with google', authToken });
  }

  twitterAuthUrl(req, res) {
    const url = authService.getTwitterAuthorizationUrl();
    res.send({ url });
  }

  async twitterLogin(req, res) {
    const { code } = req.body;
    const authToken = await authService.twitterLogin(code);
    res.send({ message: 'Successfully logged in with twitter', authToken });
  }

  facebookAuthUrl(req, res) {
    const url = authService.getFacebookAuthorizationUrl();
    res.send({ url });
  }

  async facebookLogin(req, res) {
    const { code } = req.body;
    const authToken = await authService.facebookLogin(code);
    res.send({ message: 'Successfully logged in with facebook', authToken });
  }
}

module.exports = AuthController;
