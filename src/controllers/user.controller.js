const UserService = require('../services/user.service');

const userService = new UserService();

class UserController {
  async getSolanaNfts(req, res) {
    const nfts = await userService.getSolanaNfts(req.user);
    res.send({ success: true, data: nfts });
  }

  async getEthereumNfts(req, res) {
    const nfts = await userService.getEthereumNfts(req.user);
    res.send({ success: true, data: nfts });
  }
}

module.exports = UserController;
