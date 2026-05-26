'use strict';

const httpProxyMiddleware = require('http-proxy-middleware');

function getProxyEntries(proxyOptions, defaults) {
  const applyDefaults = (opts) => ({ ...defaults, ...opts });
  const normalizeTarget = (input) => typeof input === "object" ? input : { target: input };
  const proxyEntries = [];
  if (!proxyOptions) {
    return proxyEntries;
  }
  if (!Array.isArray(proxyOptions)) {
    for (const key in proxyOptions) {
      proxyEntries.push({
        context: key,
        options: applyDefaults(normalizeTarget(proxyOptions[key]))
      });
    }
    return proxyEntries;
  }
  for (const input of proxyOptions) {
    if (Array.isArray(input)) {
      proxyEntries.push({
        context: input[0],
        options: applyDefaults(normalizeTarget(input[1]))
      });
    } else if (typeof input === "object") {
      const { context, options } = input;
      proxyEntries.push({
        context,
        options: applyDefaults(normalizeTarget(options))
      });
    } else {
      proxyEntries.push({
        context: input,
        options: applyDefaults()
      });
    }
  }
  return proxyEntries;
}

const proxyModule = function(options) {
  const nuxt = this.nuxt;
  if (!nuxt.options.server || !nuxt.options.proxy) {
    return;
  }
  const defaults = {
    changeOrigin: true,
    ws: true,
    ...options
  };
  const proxyEntries = getProxyEntries(nuxt.options.proxy, defaults);
  for (const proxyEntry of proxyEntries) {
    this.addServerMiddleware({
      prefix: false,
      // http-proxy-middleware uses req.originalUrl
      handler: httpProxyMiddleware.createProxyMiddleware({
        ...proxyEntry.options,
        pathFilter: proxyEntry.context
      })
    });
  }
};
proxyModule.meta = require("../package.json");

module.exports = proxyModule;
