import { ethers } from 'ethers';
import { INFURA_API_KEY } from './config';

const NETWORK = {
  LOCAL: 'local',
  RINKEBY: 'rinkeby',
  ROPSTEN: 'ropsten',
  GOERLI: 'goerli',
  MAINNET: 'mainnet',
  SMARTBCH: 'smartbch',
  "SMARTBCH-AMBER": 'smartbch-amber',
  DOGECHAIN: 'dogechain',
  "DOGECHAIN-TESTNET": 'dogechain-testnet',
};

const NETWORK_ID: any = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  1337: 'local',
  10000: 'smartbch',
  10001: 'smartbch-amber',
  2000: 'dogechain',
  568: 'dogechain-testnet',
};

export default function getNetwork(network: string): any {
  // currently subgraphs used under this function are outdated,
  // we will have namewrapper support and more attributes when latest subgraph goes to production
  let SUBGRAPH_URL: string;
  let INFURA_URL: string;
  let NETWORKISH: any = undefined;
  switch (network) {
    case NETWORK.LOCAL:
      SUBGRAPH_URL = 'http://127.0.0.1:8000/subgraphs/name/graphprotocol/ens';
      INFURA_URL = `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case NETWORK.RINKEBY:
      SUBGRAPH_URL =
        'https://api.thegraph.com/subgraphs/name/makoto/ensrinkeby';
      INFURA_URL = `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case NETWORK.ROPSTEN:
      SUBGRAPH_URL =
        'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten';
      INFURA_URL = `https://ropsten.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case NETWORK.GOERLI:
      SUBGRAPH_URL =
        'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli';
      INFURA_URL = `https://goerli.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case NETWORK.MAINNET:
      SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';
      INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
      break;
    case NETWORK.SMARTBCH:
      SUBGRAPH_URL = 'https://graph.bch.domains/subgraphs/name/graphprotocol/ens';
      INFURA_URL = `https://smartbch.fountainhead.cash/mainnet`;
      NETWORKISH = {
        name: "smartbch",
        chainId: 10000,
        ensAddress: "0xCfb86556760d03942EBf1ba88a9870e67D77b627"
      }
      break;
    case NETWORK["SMARTBCH-AMBER"]:
      SUBGRAPH_URL = 'https://graph.bch.domains/subgraphs/name/graphprotocol/ens-amber';
      INFURA_URL = `http://moeing.tech:8545`;
      NETWORKISH = {
        name: "smartbch-amber",
        chainId: 10001,
        ensAddress: "0x32f1FBE59D771bdB7FB247FE97A635f50659202b"
      }
      break;
    case NETWORK.DOGECHAIN:
      SUBGRAPH_URL = 'https://graph.bch.domains/subgraphs/name/graphprotocol/ens-dogechain';
      INFURA_URL = `https://rpc.yodeswap.dog`;
      NETWORKISH = {
        name: "dogechain",
        chainId: 2000,
        ensAddress: "0x834C46666c1dE7367B252682B9ABAb458DD333bf"
      }
      break;
    case NETWORK['DOGECHAIN-TESTNET']:
      SUBGRAPH_URL = 'https://graph.bch.domains/subgraphs/name/graphprotocol/ens-dogechain-testnet';
      INFURA_URL = `https://rpc-testnet.dogechain.dog`;
      NETWORKISH = {
        name: "dogechain-testnet",
        chainId: 568,
        ensAddress: "0x08850859CE6B62A39918c8B806AfbE3442fE7b0b"
      }
      break;
    default:
      throw new Error(`Unknown network '${network}'`);
  }


  const provider = new ethers.providers.StaticJsonRpcProvider(INFURA_URL, NETWORKISH);
  return { INFURA_URL, SUBGRAPH_URL, provider };
}
