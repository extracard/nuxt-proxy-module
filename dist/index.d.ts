import { Module } from '@nuxt/types';
import { Options, Filter } from 'http-proxy-middleware';

type ProxyContext = Filter;
type ProxyOptionsObject = {
    [target: string]: Options;
};
type ProxyOptionsArray = Array<[ProxyContext, Options?] | Options | string>;
type NuxtProxyOptions = ProxyOptionsObject | ProxyOptionsArray;

declare module '@nuxt/types' {
    interface Configuration {
        proxy?: NuxtProxyOptions;
    }
}
declare const proxyModule: Module<Options>;

export { proxyModule as default };
