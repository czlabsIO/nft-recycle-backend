const axios = require('axios');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const ethers = require('ethers');
const fetch = require('node-fetch');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

const {
  NODE_ENV,
  SOLANA_CLUSTER,
  SOL_RPC,
  FE_MESSAGE_TO_SIGN,
  OPENSEA_API_KEY,
} = process.env;

class Web3Helper {
  constructor() {
    this.solConnection = new Connection(
      SOLANA_CLUSTER === 'mainnet' ? SOL_RPC : clusterApiUrl('devnet')
    );
    this.mx = new Metaplex(this.solConnection);
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

  async verifySolLedgerSign(walletAddress, signature) {
    const tx = await this.solConnection.getParsedTransaction(signature, {
      commitment: 'confirmed',
    });
    const pubKey = tx?.transaction?.message?.accountKeys[0]?.pubkey
      ? tx.transaction.message.accountKeys[0].pubkey.toString()
      : '';
    return pubKey === walletAddress;
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

  async getSolanaNfts(walletAddress) {
    const graphql = JSON.stringify({
      operationName: 'InventoryBySlug',
      variables: {
        owner: walletAddress,
        slugsToInflate: null,
        includeFrozen: true,
      },
      query: `query 
      InventoryBySlug($owner: String!, $slugsToInflate: [String!], $includeFrozen: Boolean) { 
        inventoryBySlug(
          owner: $owner
          slugsToInflate: $slugsToInflate
          includeFrozen: $includeFrozen
        ) {
          ...ReducedInstrumentWithMints
        } 
      }
      fragment ReducedInstrumentWithMints on InstrumentWithMints {
        slug
        slugDisplay
        name
        imageUri
        id
        mintCount
        tokenStandard
        mints {
          ...ReducedMintWithColl
        }
      }
      fragment ReducedMintWithColl on MintWithColl {
        ...ReducedMint
      }
      fragment ReducedMint on TLinkedTxMintTV2 {
        onchainId
        name
        tokenStandard
        imageUri
        rarityRankTT
      }`,
    });
    const graphql_res = await fetch('https://graphql.tensor.trade/graphql', {
      headers: {
        accept: '*/*',
        'accept-language': 'en,en-US;q=0.9',
        'content-type': 'application/json',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.tensor.trade/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: graphql,
      method: 'POST',
    });

    const graphql_data = await graphql_res.json();
    return graphql_data.data.inventoryBySlug;
  }
}

module.exports = Web3Helper;
