import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware'
import type { Module } from '@nuxt/types'
import { HttpProxyOptions, getProxyEntries, NuxtProxyOptions } from './options'

declare module '@nuxt/types' {
  interface Configuration {
    proxy?: NuxtProxyOptions
  }
}

const proxyModule: Module<HttpProxyOptions> = function (options: HttpProxyOptions) {
  const nuxt: any = this.nuxt

  if (!nuxt.options.server || !nuxt.options.proxy) {
    return
  }

  // Defaults
  const defaults: HttpProxyOptions = {
    changeOrigin: true,
    ws: true,
    ...options
  }

  const proxyEntries = getProxyEntries(nuxt.options.proxy as NuxtProxyOptions, defaults)

  // Register middleware
  for (const proxyEntry of proxyEntries) {
    // https://github.com/chimurai/http-proxy-middleware
    // Using http-proxy-middleware v3 API:
    // In v3, pathFilter is set within the options object (not as a separate context parameter).
    // This wires proxyEntry.context → middlewareOptions.pathFilter for the v3 createProxyMiddleware() call.
    const middlewareOptions = {
      ...proxyEntry.options,
      pathFilter: proxyEntry.context
    }
    this.addServerMiddleware({
      handler: createProxyMiddleware(middlewareOptions) as RequestHandler
    })
  }
}

// @ts-ignore
proxyModule.meta = require('../package.json')

export default proxyModule
