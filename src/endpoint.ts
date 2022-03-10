import { Express } from 'express';

import * as utils from './utils'

export default function (app: Express) {
  app.all("/", async (req, res) => {
    const host = (req.headers.host || "").split('.');
    host.pop();

    const domain = host.join('.');
    if (domain === "bch") {
      res.send(utils.rootPage());
      return;
    }

    const links = await utils.getLinks(domain);
    if (links.contentHashUrl || links.url) {
      res.redirect(301, (links.contentHashUrl || links.url)!);
      return;
    }

    res.status(404).send(utils.notFoundPage(domain));
  });

  app.get("/:param", async (req, res) => {
    if (["favicon.ico", "robots.txt"].indexOf(req.params.param) !== -1) {
      console.log('filtered out', req.params.param);
      res.send();
      return;
    }

    const host = (req.headers.host || "").split('.');
    host.pop();

    const domain = host.join('.');
    if (domain === "bch") {
      res.send(utils.rootPage());
      return;
    }

    if (req.params.param === "contenthash") {
      const url = await utils.getContentHashRedirect(domain);
      if (url) {
        res.redirect(301, url);
        return;
      }
    }

    const [textKey, known] = utils.paramToTextKey(req.params.param);
    const record = await utils.getTextRecord(domain, textKey);
    if (!record) {
      res.status(404).send(utils.notFoundPage(domain));
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
