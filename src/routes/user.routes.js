const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const UserController = require('../controllers/user.controller');

const userController = new UserController();

router.get('/getSolanaNfts', auth, userController.getSolanaNfts);
router.get('/getEthereumNfts', auth, userController.getEthereumNfts);
router.get('/getDetails', auth, userController.getUserDetails);
router.post('/generateInvoice', auth, userController.generateInvoice);
router.post('/addEmail', auth, userController.addEmail);
router.get('/getInvoices', auth, userController.getInvoices);

module.exports = router;
