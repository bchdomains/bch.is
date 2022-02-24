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
        ensAddress: "0x781420e2C228821Eed99403470AC62C9cc4C0Cf7"
      }
      break;
    case NETWORK["SMARTBCH-AMBER"]:
      SUBGRAPH_URL = 'https://graph.bch.domains/subgraphs/name/graphprotocol/ens-amber';
      INFURA_URL = `http://moeing.tech:8545`;
      NETWORKISH = {
        name: "smartbch-amber",
        chainId: 10001,
        ensAddress: "0x2Ced35ee5cB0596D40D51cec8fdd12e1057b5Db7"
      }
      break;
    default:
      throw new Error(`Unknown network '${network}'`);
  }


  const provider = new ethers.providers.StaticJsonRpcProvider(INFURA_URL, NETWORKISH);
  return { INFURA_URL, SUBGRAPH_URL, provider };
}
