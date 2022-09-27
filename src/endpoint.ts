import { Express } from 'express';

import * as utils from './utils'

const supportedDomains = ["bch", "doge", "dc"]

export default function (app: Express) {
  app.all("/", async (req, res) => {
    const hostParts = (req.headers.host || "").split('.');
    const host = hostParts.slice(-2).join('.');
    hostParts.pop();
    let domain = hostParts.join('.');

    if (domain.endsWith('dcdomain')) {
      domain = domain.replace(/dcdomain$/, "dc")
    }

    if (supportedDomains.includes(domain)) {
      res.send(utils.rootPage(host));
      return;
    }

    const links = await utils.getLinks(domain, host);
    if (links.contentHashUrl || links.url) {
      res.redirect(301, (links.contentHashUrl || links.url)!);
      return;
    }

    res.status(404).send(utils.notFoundPage(domain, host));
  });

  app.get("/:param", async (req, res) => {
    if (["favicon.ico", "robots.txt"].indexOf(req.params.param) !== -1) {
      console.log('filtered out', req.params.param);
      res.send();
      return;
    }

    const hostParts = (req.headers.host || "").split('.');
    const host = hostParts.slice(-2).join('.');
    hostParts.pop();
    let domain = hostParts.join('.');

    if (domain.endsWith('.dcdomain')) {
      domain = domain.replace(/dcdomain$/, "dc")
    }

    if (supportedDomains.includes(domain)) {
      res.send(utils.rootPage(host));
      return;
    }

    if (req.params.param === "contenthash") {
      const url = await utils.getContentHashRedirect(domain, host);
      if (url) {
        res.redirect(301, url);
        return;
      }
    }

    const [textKey, known] = utils.paramToTextKey(req.params.param);
    const record = await utils.getTextRecord(domain, textKey, host);
    if (!record) {
      res.status(404).send(utils.notFoundPage(domain, host));
      return;
    }

    if (known) {
      const url = utils.recordLink(textKey, record);
      res.redirect(301, url);
    } else {
      res.send(record);
    }
  });
}
