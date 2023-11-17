const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const UserController = require('../controllers/user.controller');

const userController = new UserController();

router.get('/getSolanaNfts', auth, userController.getSolanaNfts);
router.get('/getEthereumNfts', auth, userController.getEthereumNfts);

module.exports = router;
