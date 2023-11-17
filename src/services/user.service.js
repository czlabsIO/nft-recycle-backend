const axios = require('axios');
const { BadRequest } = require('http-errors');
const Web3Helper = require('../utils/web3Helper');
const User = require('../models/user');

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

  async getSolanaNfts(user) {
    if (!user.walletAddress) throw new BadRequest('No wallet address found');

    const nfts = await this.web3Helper.getAllNftsOfOwner(user.walletAddress);
    console.log(nfts.length);
    const groupedData = {};
    await Promise.all(
      nfts.map(async (item) => {
        const collectionAddress = item?.collection?.address;
        if (collectionAddress) {
          if (!groupedData[collectionAddress]) {
            // const collectionName =
            //   await this.web3Helper.getSolanaCollectionName(collectionAddress);
            groupedData[collectionAddress] = {
              collectionAddress,
              // collectionName,
              nfts: [],
            };
          }
          const { data } = await axios.get(item.uri);
          groupedData[collectionAddress].nfts.push({
            name: item.name,
            symbol: item.symbol,
            address: item.address,
            mintAddress: item.mintAddress,
            metadata: item.uri,
            image: data.image,
          });
        }
      })
    );
    return groupedData;
  }

  async getEthereumNfts(user) {
    if (!user.walletAddress) throw new BadRequest('No wallet address found');

    const nfts = await this.web3Helper.getEthereumNfts(user.walletAddress);
    console.log(nfts.length);
    const groupedData = {};
    await Promise.all(
      nfts.map(async (item) => {
        const contract = item.contract;
        if (!groupedData[contract]) {
          groupedData[contract] = {
            contract,
            collection: item.collection,
            nfts: [],
          };
        }
        groupedData[contract].nfts.push({
          name: item.name,
          identifier: item.identifier,
          token_standard: item.token_standard,
          metadata: item.metadata_url,
          image: item.image_url,
        });
      })
    );
    return groupedData;
  }
}

module.exports = UserService;
