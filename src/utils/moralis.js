const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const { logger } = require('./logger');

const { MORALIS_API_KEY, NODE_ENV } = process.env;

const connectMoralis = async () => {
  try {
    await Moralis.start({
      apiKey: MORALIS_API_KEY,
    });

    logger.info(`Connected To Moralis`);
  } catch (error) {
    logger.error(`Error in connection with Moralis ${error.message}`);
  }
};

const getEthereumNfts = async (wallet) => {
  try {
    let cursor = null;
    let nfts = [];
    const chain =
      NODE_ENV === 'development' ? EvmChain.SEPOLIA : EvmChain.ETHEREUM;
    do {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        chain,
        format: 'decimal',
        mediaItems: false,
        address: wallet,
        cursor,
      });
      nfts.push(...response.jsonResponse.result);
      cursor = response.jsonResponse.cursor;
    } while (cursor != '' && cursor != null);
    return nfts;
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { connectMoralis, getEthereumNfts };
