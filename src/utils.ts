import { ethers } from "ethers"
import getNetwork from "./network"

const contentHash = require('@ensdomains/content-hash')

export function prependUrl(url: string) {
  if (url && !url.match(/http[s]?:\/\//)) {
    return 'https://' + url
  } else {
    return url
  }
}

export const paramToTextKey = (param) => {
  const map = {
    twitter: 'com.twitter',
    github: 'com.github',
    gitlab: 'com.gitlab',
    reddit: 'com.reddit',
    telegram: 'org.telegram',
    email: 'email',
    url: 'url',
    avatar: 'avatar'
  }
  if (map[param]) {
    return [map[param], true];
  }

  return [param, false];
}

export const recordLink = (textKey: string, value: string) => {
  let url = ""
  switch (textKey) {
    case 'url':
      url = `${value}`
      break
    case 'com.twitter':
      url = `twitter.com/${value}`
      break
    case 'com.github':
      url = `github.com/${value}`
      break
    case 'com.gitlab':
      url = `gitlab.com/${value}`
      break
    case 'com.reddit':
      url = `reddit.com/u/${value}`
      break
    case 'org.telegram':
      url = `t.me/${value}`
      break
    default:
      url = `${value}`
      break
  }
  url = prependUrl(url)

  if (textKey === 'email') {
    url = `mailto:${value}`
  }

  return url
}


function matchProtocol(text: string){
  return text.match(/^(ipfs|sia|ipns|bzz|onion|onion3|arweave):\/\/(.*)/)
    || text.match(/\/(ipfs)\/(.*)/)
    || text.match(/\/(ipns)\/(.*)/)
}


function getProtocolType(encoded: string) {
  let protocolType, decoded
  try {
    let matched = matchProtocol(encoded)
    if (matched) {
      protocolType = matched[1]
      decoded = matched[2]
    }
    return {
      protocolType,
      decoded
    }
  } catch (e) {
    console.log(e)
  }
}

const ContentHashLink = (value: string) => {
  const rslt = getProtocolType(value)

  const protocolType = rslt?.protocolType
  const decoded = rslt?.decoded

  let externalLink, url
  if (protocolType === 'ipfs') {
    externalLink = `https://dweb.link/ipfs/${decoded}` // using ipfs's secured origin gateway
    url = `ipfs://${decoded}`
  } else if (protocolType === 'ipns') {
    externalLink = `https://dweb.link/ipns/${decoded}`
    url = `ipns://${decoded}`
  } else if (protocolType === 'bzz') {
    externalLink = `https://gateway.ethswarm.org/bzz/${decoded}`
    url = `bzz://${decoded}`
  } else if (protocolType === 'onion' || protocolType === 'onion3') {
    externalLink = `http://${decoded}.onion`
    url = `onion://${decoded}`
  } else if (protocolType === 'sia') {
    externalLink = `https://siasky.net/${decoded}`
    url = `sia://${decoded}`
  } else if (protocolType === 'arweave') {
    externalLink = `https://arweave.net/${decoded}`
    url = `arweave://${decoded}`
  }

  return { externalLink, url }
}

export function decodeContenthash(encoded: any) {
  let decoded, protocolType, error
  if(!encoded || encoded === '0x'){
    return {}
  }
  if (encoded.error) {
    return { protocolType: null, decoded: encoded.error }
  }else if(encoded === false){
    return { protocolType: null, decoded: 'invalid value' }
  }
  if (encoded) {
    try {
      decoded = contentHash.decode(encoded)
      const codec = contentHash.getCodec(encoded)
      if (codec === 'ipfs-ns') {
        protocolType = 'ipfs'
      } else if (codec === 'ipns-ns') {
        protocolType = 'ipns'
      } else if (codec === 'swarm-ns') {
        protocolType = 'bzz'
      } else if (codec === 'onion') {
        protocolType = 'onion'
      } else if (codec === 'onion3') {
        protocolType = 'onion3'
      } else if (codec === 'skynet-ns') {
        protocolType = 'sia'
      } else if (codec === 'arweave-ns') {
        protocolType = 'arweave'
      } else {
        decoded = encoded
      }
    } catch (e: any) {
      error = e.message
    }
  }
  return { protocolType, decoded, error }
}

export function getContentHashExternalLink(encoded: string): string | undefined {
  const { protocolType, decoded } = decodeContenthash(encoded);
  const { externalLink } = ContentHashLink(`${protocolType}://${decoded}`)
  return externalLink;
}

let resolverAddress = {};
async function getResolverAddress(provider) {
  const chainId: number = provider._network.chainId;
  if (resolverAddress[chainId]) {
    return resolverAddress[chainId];
  }

  const registryABI = [
    'function resolver(bytes32 node) external view returns (address)'
  ]
  const contract = new ethers.Contract(
    provider.network.ensAddress,
    registryABI,
    provider
  );
  resolverAddress[chainId] = await contract.resolver(ethers.utils.namehash('resolver.eth'));
  return resolverAddress[chainId];
}

const resolverABI = [
  'function contenthash(bytes32 node) view returns (bytes memory)',
  'function text(bytes32 node, string calldata key) view returns (string memory)',
]

export function getNetworkByHost(host: string) {
  if (host.toLowerCase().endsWith("bch.is")) {
    return getNetwork("smartbch");
  }

  if (host.toLowerCase().endsWith("doge.wf")) {
    return getNetwork("dogechain");
  }

  // if (host.toLowerCase().endsWith("uniw.to")) {
    return getNetwork("ethpow");
  // }
}

export async function getLinks(
  domain: string, host: string
): Promise<{ contentHashUrl?: string, url?: string }> {
  const { provider } = getNetworkByHost(host);

  try {
    const contract = new ethers.Contract(
      await getResolverAddress(provider),
      resolverABI,
      provider
    );
    const namehash = ethers.utils.namehash(domain);
    const results = await Promise.all([contract.contenthash(namehash), contract.text(namehash, 'url')]);

    return {
      contentHashUrl: getContentHashExternalLink(results[0]),
      url: results[1]
    }
  } catch (error) {
    throw error
  }
}

export async function getContentHashRedirect(
  domain: string, host: string
): Promise<string | undefined> {
  const { provider } = getNetworkByHost(host);

  try {
    const contract = new ethers.Contract(
      await getResolverAddress(provider),
      resolverABI,
      provider
    );
    const namehash = ethers.utils.namehash(domain);
    return getContentHashExternalLink(await contract.contenthash(namehash));
  } catch (error) {
    throw error
  }
}

export async function getTextRecord(
  domain: string, field: string, host: string
): Promise<string | undefined> {
  const { provider } = getNetworkByHost(host);

  try {
    const contract = new ethers.Contract(
      await getResolverAddress(provider),
      resolverABI,
      provider
    );
    const namehash = ethers.utils.namehash(domain);
    return contract.text(namehash, field);
  } catch (error) {
    throw error
  }
}

export function redirectPage(url?: string) {
  return `
<!doctype html>
<html lang="en">
  <body>
    <script>document.location = "${url}";</script>
  </body>
</html>`
}

export function notFoundPage(domain: string, host: string) {
  const url = {
    "bch.is": `https://app.bch.domains/name/${domain}`,
    "doge.wf": `https://app.dogedomains.wf/name/${domain}`,
    "dcdomain.wf": `https://app.dogedomains.wf/name/${domain}`,
    "uniw.to": `https://uniwens.com/name/${domain}`
  }[host];
  return `
<!doctype html>
<html lang="en">
  <body>
    <h2>Redirect link not found for ${domain}</h2>
    <div>
      <p>If you are owner of this ENS name, set 'ContentHash' or 'URL' at <a href="${url}">${url}</a></p>
      <p>This page will be used to redirect to a resolved external link first using 'ContentHash'</p>
      <p>It will fall back to a link set in 'URL' field</p>
    </div>
  </body>
</html>`
}

export function rootPage(host: string) {
  const url = {
    "bch.is": `https://app.bch.domains`,
    "doge.wf": `https://app.dogedomains.wf`,
    "dcdomain.wf": `https://app.dogedomains.wf`,
    "uniw.to": `https://uniwens.com`
  }[host];

  const descriptionUrl = {
    "bch.is": `https://lns.bch.is/description`,
    "doge.wf": `https://dns.doge.wf/description`,
    "dcdomain.wf": `https://dns.doge.wf/description`,
    "uniw.to": `https://uniwens.uniw.to/description`,
  }[host];

  const header = {
    "bch.is": `bch.domains`,
    "doge.wf": `dogedomains.wf`,
    "dcdomain.wf": `dogedomains.wf`,
    "uniw.to": `uniw.to`,
  }[host];

  const tld = {
    "bch.is": `.bch`,
    "doge.wf": `.doge`,
    "dcdomain.wf": `.dc`,
    "uniw.to": `.uniw`,
  }[host];

  return `
<!doctype html>
<html lang="en">
  <body>
    <h2>${header} resolution service</h2>
    <div>
      <p>If you are owner of a ${tld} domain, you can set 'ContentHash' or 'URL' in the app <a href="${url}">${url}</a></p>
      <p>This service redirects to a resolved external link first using 'ContentHash'</p>
      <p>It will fall back to a link set in 'URL' field</p>
      <p>You can set content to any other field and it will be rendered in this service. E.g. <a href="${descriptionUrl}">${descriptionUrl}</a></p>
    </div>
  </body>
</html>`
}