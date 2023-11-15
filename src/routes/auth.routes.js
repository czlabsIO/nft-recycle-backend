const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const authController = new AuthController();

router.get('/discord/auth-url', authController.discordAuthUrl);
router.post('/discord/login', authController.discordLogin);
router.get('/google/client-id', authController.googleClientId);
router.post('/google/login', authController.googleLogin);
router.get('/twitter/auth-url', authController.twitterAuthUrl);
router.post('/twitter/login', authController.twitterLogin);
router.get('/facebook/auth-url', authController.facebookAuthUrl);
router.post('/facebook/login', authController.facebookLogin);

module.exports = router;
