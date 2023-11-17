const axios = require('axios');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const ethers = require('ethers');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

const {
  NODE_ENV,
  SOLANA_CLUSTER,
  SOL_RPC,
  ETH_RPC,
  FE_MESSAGE_TO_SIGN,
  OPENSEA_API_KEY,
} = process.env;

class Web3Helper {
  constructor() {
    this.solConnection = new Connection(
      SOLANA_CLUSTER === 'mainnet' ? SOL_RPC : clusterApiUrl('devnet')
    );
    this.mx = new Metaplex(this.solConnection);
    this.ethProvider = new ethers.JsonRpcProvider(ETH_RPC);
  }

  async verifySolanaSignature(walletAddress, signature) {
    const message = new TextEncoder().encode(FE_MESSAGE_TO_SIGN);
    const pubKeyUint8 = bs58.decode(walletAddress);
    const result = nacl.sign.detached.verify(
      message,
      new Uint8Array(bs58.decode(signature)),
      pubKeyUint8
    );
    return result;
  }

  async verifyEthSignature(walletAddress, signature) {
    const address = ethers.verifyMessage(FE_MESSAGE_TO_SIGN, signature);
    return walletAddress === address;
  }

  async getSolanaCollectionName(collectionAddress) {
    const mintAddress = new PublicKey(collectionAddress);
    const data = await this.mx.nfts().findByMint({ mintAddress });
    return data.name;
  }

  async getAllNftsOfOwner(ownerAddr) {
    const owner = new PublicKey(ownerAddr);
    const nfts = await this.mx.nfts().findAllByOwner({ owner });
    return nfts;
  }

  async getEthereumNfts(walletAddress) {
    let uri =
      NODE_ENV === 'production'
        ? `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts`
        : `https://testnets-api.opensea.io/api/v2/chain/sepolia/account/${walletAddress}/nfts`;
    let options = {};
    if (NODE_ENV === 'production') {
      options = {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY,
        },
      };
    }
    let next = '';
    let nfts = [];
    while (next != null) {
      let url = uri;
      if (next != '') {
        url += `?next=${next}`;
      }
      const openseaRet = await axios.get(url, options);
      nfts.push(...openseaRet.data.nfts);
      next = openseaRet.data.next;
    }
    return nfts;
  }
}

module.exports = Web3Helper;
