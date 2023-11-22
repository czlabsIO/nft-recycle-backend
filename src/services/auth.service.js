const { google } = require('googleapis');
const { createBasicAuthToken } = require('../utils/util.js');
const { default: axios } = require('axios');
const { BadRequest } = require('http-errors');
const UserService = require('./user.service.js');
const Web3Helper = require('../utils/web3Helper');
const {
  validateAuth,
  validateWalletLogin,
} = require('../validators/auth.validator.js');

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_REDIRECT_URI,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_REDIRECT_URI,
} = process.env;

class AuthService {
  constructor() {
    this.userService = new UserService();
    this.web3Helper = new Web3Helper();
  }

  getDiscordAuthorizationUrl() {
    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.append('client_id', DISCORD_CLIENT_ID);
    url.searchParams.append('redirect_uri', DISCORD_REDIRECT_URI);
    url.searchParams.append('scope', 'identify email');
    url.searchParams.append('response_type', 'code');
    return url.toString();
  }

  async discordLogin(code) {
    const { data: tokenData } = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        redirect_uri: DISCORD_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { data: userData } = await axios.get(
      'https://discord.com/api/users/@me',
      {
        headers: {
          authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      }
    );

    let user = await this.userService.getUserByEmail(userData.email);
    if (!user) {
      user = await this.userService.createUser({
        name: userData.global_name,
        email: userData.email,
        discordId: userData.id,
      });
    }

    return user.generateAuthToken();
  }

  getGoogleClientId() {
    return GOOGLE_CLIENT_ID;
  }

  async googleLogin(code) {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: userData } = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      method: 'GET',
    });

    let user = await this.userService.getUserByEmail(userData.email);
    if (!user) {
      user = await this.userService.createUser({
        name: userData.name,
        email: userData.email,
        googleId: userData.sub,
      });
    }

    return user.generateAuthToken();
  }

  getTwitterAuthorizationUrl() {
    const url = new URL('https://twitter.com/i/oauth2/authorize');
    url.searchParams.append('client_id', TWITTER_CLIENT_ID);
    url.searchParams.append('redirect_uri', TWITTER_REDIRECT_URI);
    url.searchParams.append('scope', 'tweet.read users.read offline.access');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', 'state');
    url.searchParams.append('code_challenge', 'challenge');
    url.searchParams.append('code_challenge_method', 'plain');
    return url.toString();
  }

  async twitterLogin(code) {
    const { data: tokenData } = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: TWITTER_REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: 'challenge',
        code,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${createBasicAuthToken(
            TWITTER_CLIENT_ID,
            TWITTER_CLIENT_SECRET
          )}`,
        },
      }
    );

    const { data: userData } = await axios.get(
      'https://api.twitter.com/2/users/me',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    let user = await this.userService.getUserByTwitterId(userData.data.id);
    if (!user) {
      user = await this.userService.createUser({
        name: userData.data.name,
        twitterId: userData.data.id,
      });
    }

    return user.generateAuthToken();
  }

  getFacebookAuthorizationUrl() {
    const url = new URL('https://www.facebook.com/dialog/oauth');
    url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
    url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
    url.searchParams.append('scope', 'public_profile email');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', 'state');
    return url.toString();
  }

  async facebookLogin(code) {
    const { data: tokenData } = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: FACEBOOK_CLIENT_ID,
          client_secret: FACEBOOK_CLIENT_SECRET,
          redirect_uri: FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const { data: userData } = await axios.get(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: ['id', 'name', 'email'].join(','),
          access_token: tokenData.access_token,
        },
      }
    );

    let user = await this.userService.getUserByEmail(userData.email);
    if (!user) {
      user = await this.userService.createUser({
        name: userData.name,
        email: userData.email,
        facebookId: userData.sub,
      });
    }

    return user.generateAuthToken();
  }

  async signup(body) {
    const { error } = validateAuth(body);
    if (error) throw new BadRequest(error.details[0].message);

    let user = await this.userService.getUserByEmail(body.email);
    if (user) {
      throw new BadRequest('Email already exists');
    }
    user = await this.userService.createUser({
      email: body.email,
      password: body.password,
    });

    return user.generateAuthToken();
  }

  async login(body) {
    const { error } = validateAuth(body);
    if (error) throw new BadRequest(error.details[0].message);

    let user = await this.userService.getUserByEmail(body.email);
    if (!user) throw new BadRequest('User not found');

    const correctPassword = user.verifyPassword(body.password);
    if (!correctPassword) throw new BadRequest('Incorrect password');

    return user.generateAuthToken();
  }

  async walletLogin(body, user) {
    const { error } = validateWalletLogin(body);
    if (error) throw new BadRequest(error.details[0].message);

    const { blockchain, walletAddress, signature, isLedger } = body;

    let result;
    if (blockchain === 'SOLANA' && isLedger === false) {
      result = await this.web3Helper.verifySolanaSignature(
        walletAddress,
        signature
      );
    } else if (blockchain === 'SOLANA' && isLedger === true) {
      result = await this.web3Helper.verifySolLedgerSign(
        walletAddress,
        signature
      );
    } else if (blockchain === 'ETHEREUM') {
      result = await this.web3Helper.verifyEthSignature(
        walletAddress,
        signature
      );
    }
    if (!result) throw new BadRequest('Signature verification failed');

    if (user) {
      user.walletAddress = walletAddress;
      await user.save();
    } else {
      let user = await this.userService.getUserByWalletAddress(walletAddress);
      if (!user) {
        user = await this.userService.createUser({
          walletAddress,
        });
      }
      return user.generateAuthToken();
    }
    return user.generateAuthToken();
  }
}

module.exports = AuthService;
