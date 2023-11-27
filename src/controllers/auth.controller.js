const AuthService = require('../services/auth.service.js');

const authService = new AuthService();

class AuthController {
  discordAuthUrl(req, res) {
    const url = authService.getDiscordAuthorizationUrl();
    res.send({ url });
  }

  async discordLogin(req, res) {
    const authToken = await authService.discordLogin(req.body);
    res.send({ message: 'Successfully logged in with discord', authToken });
  }

  googleClientId(req, res) {
    const clientId = authService.getGoogleClientId();
    res.send({ clientId });
  }

  async googleLogin(req, res) {
    const authToken = await authService.googleLogin(req.body);
    res.send({ message: 'Successfully logged in with google', authToken });
  }

  twitterAuthUrl(req, res) {
    const url = authService.getTwitterAuthorizationUrl();
    res.send({ url });
  }

  async twitterLogin(req, res) {
    const authToken = await authService.twitterLogin(req.body);
    res.send({ message: 'Successfully logged in with twitter', authToken });
  }

  facebookAuthUrl(req, res) {
    const url = authService.getFacebookAuthorizationUrl();
    res.send({ url });
  }

  async facebookLogin(req, res) {
    const authToken = await authService.facebookLogin(req.body);
    res.send({ message: 'Successfully logged in with facebook', authToken });
  }

  async signup(req, res) {
    const authToken = await authService.signup(req.body);
    res.send({ message: 'Successful signup with email', authToken });
  }

  async login(req, res) {
    const authToken = await authService.login(req.body);
    res.send({ message: 'Successfully logged in with email', authToken });
  }

  async walletLogin(req, res) {
    const authToken = await authService.walletLogin(req.body, req.user);
    res.send({ message: 'Successfully logged in with wallet', authToken });
  }
}

module.exports = AuthController;
