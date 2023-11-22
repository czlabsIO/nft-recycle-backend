const UserService = require('../services/user.service');

const userService = new UserService();

class UserController {
  async getSolanaNfts(req, res) {
    const nfts = await userService.getSolanaNfts(req.user, req.query);
    res.send({ success: true, data: nfts });
  }

  async getEthereumNfts(req, res) {
    const nfts = await userService.getEthereumNfts(req.user, req.query);
    res.send({ success: true, data: nfts });
  }

  async getUserDetails(req, res) {
    res.send({ success: true, data: req.user });
  }

  async generateInvoice(req, res) {
    const data = await userService.generateInvoice(req.user, req.body);
    res.send({ success: true, data });
  }

  async addEmail(req, res) {
    await userService.addEmail(req.user, req.body);
    res.send({ success: true, message: 'Email sent successfully' });
  }
}

module.exports = UserController;
