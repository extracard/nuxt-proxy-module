import type { Filter, Options as HttpProxyOptions } from 'http-proxy-middleware'
export type { Options as HttpProxyOptions } from 'http-proxy-middleware'

export type ProxyContext = Filter | HttpProxyOptions
export type ProxyEntry = { context: Filter | undefined, options: HttpProxyOptions }

export type ProxyOptionsObject = { [target: string]: HttpProxyOptions }
export type ProxyOptionsArray = Array<[ProxyContext, HttpProxyOptions?] | HttpProxyOptions | string>
export type NuxtProxyOptions = ProxyOptionsObject | ProxyOptionsArray

export function getProxyEntries (proxyOptions: NuxtProxyOptions, defaults: HttpProxyOptions): ProxyEntry[] {
  const applyDefaults = (opts?: HttpProxyOptions) => ({ ...defaults, ...opts }) as HttpProxyOptions
  const normalizeTarget = (input: string | HttpProxyOptions) =>
    (typeof input === 'object' ? input : { target: input }) as HttpProxyOptions

  const proxyEntries: ProxyEntry[] = []

  if (!proxyOptions) {
    return proxyEntries
  }

  // Object mode
  if (!Array.isArray(proxyOptions)) {
    for (const key in proxyOptions) {
      proxyEntries.push({
        context: key,
        options: applyDefaults(normalizeTarget(proxyOptions[key]))
      })
    }
    return proxyEntries
  }

  // Array mode
  for (const input of proxyOptions) {
    if (Array.isArray(input)) {
      const [context, opts] = input
      // Check if context is actually HttpProxyOptions (an object with target, etc.)
      if (typeof context === 'object' && context !== null && !Array.isArray(context) && typeof (context as any).target !== 'undefined') {
        // context is HttpProxyOptions, merge it into options
        proxyEntries.push({
          context: undefined,
          options: applyDefaults({ ...context, ...opts })
        })
      } else {
        // context is a Filter (string, string[], or function)
        proxyEntries.push({
          context: context as Filter,
          options: applyDefaults(normalizeTarget(opts as string))
        })
      }
    } else if (typeof input === 'object') {
      const entry = input as any
      // Check if this is a ProxyEntry with context and options
      if ('context' in entry && 'options' in entry) {
        const { context, options } = entry
        // Check if context is actually HttpProxyOptions
        if (typeof context === 'object' && context !== null && !Array.isArray(context) && typeof (context as any).target !== 'undefined') {
          // context is HttpProxyOptions, merge it into options
          proxyEntries.push({
            context: undefined,
            options: applyDefaults({ ...context, ...normalizeTarget(options) })
          })
        } else {
          // context is a Filter
          proxyEntries.push({
            context: context as Filter,
            options: applyDefaults(normalizeTarget(options))
          })
        }
      } else {
        // This is just HttpProxyOptions
        proxyEntries.push({
          context: undefined,
          options: applyDefaults(normalizeTarget(input))
        })
      }
    } else {
      proxyEntries.push({
        context: input,
        options: applyDefaults()
      })
    }
  }
  return proxyEntries
}
