const axios = require('axios');
const { BadRequest } = require('http-errors');
const Web3Helper = require('../utils/web3Helper');
const User = require('../models/user');
const Invoice = require('../models/invoice');
const {
  validateGenerateInvoice,
  validateAddEmail,
} = require('../validators/user.validator');
const { createInvoice } = require('../utils/createInvoice');
const { uploadToS3 } = require('../utils/amazonS3');
const { sendMailWithTemplate } = require('../utils/nodemailer');
const { getEthereumNfts } = require('../utils/moralis');
const { logger } = require('../utils/logger');
const { AWS_BUCKET_NAME, AWS_REGION } = process.env;

class UserService {
  constructor() {
    this.web3Helper = new Web3Helper();
  }

  createUser(data) {
    return User.create(data);
  }

  getUserById(_id) {
    return User.findById(_id);
  }

  getUserByEmail(email) {
    return User.findOne({ email });
  }

  getUserByTwitterId(id) {
    return User.findOne({ twitterId: id });
  }

  getUserByWalletAddress(walletAddress) {
    return User.findOne({ walletAddress });
  }

  async getSolanaNfts(user, query) {
    if (!user.walletAddress) throw new BadRequest('No wallet address found');

    let nfts = [];
    try {
      nfts = await this.web3Helper.getSolanaNfts(user.walletAddress);
    } catch (err) {
      logger.error(err);
      throw new BadRequest('Failed to fetch NFTs');
    }

    if (query.key) {
      const condition = new RegExp(query.key, 'i');
      const filteredNfts = nfts.filter((item) => {
        return condition.test(item.name);
      });
      nfts = filteredNfts;
    }

    const groupedData = {};
    await Promise.all(
      nfts.map(async (item) => {
        const collectionAddress = item.id;
        if (!groupedData[collectionAddress]) {
          groupedData[collectionAddress] = {
            collectionAddress,
            collectionName: item.name,
            collectionImage: item.imageUri,
            nfts: item.mints,
          };
        }
      })
    );
    return groupedData;
  }

  async getEthereumNfts(user, query) {
    if (!user.walletAddress) throw new BadRequest('No wallet address found');

    let nfts = await getEthereumNfts(user.walletAddress);

    if (query.key) {
      const condition = new RegExp(query.key, 'i');
      const filteredNfts = nfts.filter((item) => {
        const metadata = JSON.parse(item.metadata);
        return condition.test(item.name) || condition.test(metadata?.name);
      });
      nfts = filteredNfts;
    }

    const groupedData = {};
    await Promise.all(
      nfts.map(async (item) => {
        const collectionAddress = item.token_address;
        if (!groupedData[collectionAddress]) {
          groupedData[collectionAddress] = {
            collectionAddress,
            collectionName: item.name,
            nfts: [],
          };
        }
        let metadata = JSON.parse(item.metadata);
        if (!metadata && item.token_uri) {
          try {
            const { data } = await axios.get(item.token_uri);
            metadata = data;
          } catch (err) {
            logger.error(err);
          }
        }
        groupedData[collectionAddress].nfts.push({
          name: metadata ? metadata.name : null,
          image: metadata ? metadata.image : null,
          token_id: item.token_id,
          token_standard: item.contract_type,
          token_uri: item.token_uri,
        });
      })
    );
    return groupedData;
  }

  async generateInvoice(user, body) {
    const { error } = validateGenerateInvoice(body);
    if (error) throw new BadRequest(error.details[0].message);

    let doc = createInvoice(body);
    // doc.pipe(fs.createWriteStream('test.pdf'));
    const time = new Date().getTime();
    const { Key, Location } = await uploadToS3(doc, `${time}.pdf`);

    const invoice = await Invoice.create({
      userId: user._id,
      blockchain: body.blockchain,
      txHash: body.txHash,
      key: Key,
    });
    if (user.email) {
      await this.sendInvoiceEmail(user.email, Location);
    }
    return {
      invoice,
      link: Location,
      assets: body.assets,
      time,
    };
  }

  async addEmail(user, body) {
    const { error } = validateAddEmail(body);
    if (error) throw new BadRequest(error.details[0].message);

    if (user.email) {
      throw new BadRequest('User email already present');
    }
    const invoice = await Invoice.findOne({ userId: user._id, key: body.key });
    if (!invoice) {
      throw new BadRequest('No invoice found');
    }

    user.email = body.email;
    await user.save();

    await this.sendInvoiceEmail(
      user.email,
      `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${invoice.key}`
    );
  }

  async sendInvoiceEmail(to, receipt) {
    const info = await sendMailWithTemplate({ to, receipt });
    return { info };
  }
}

module.exports = UserService;
