'use strict';
var cheerio = require('cheerio'),
    request = require('request'),
    when = require('when');

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
/**
 * [isExternal find if link is external]
 * @param  {[string]} link [link to test]
 * @return Boolean       [true, if link is external one]
 */
function isExternal(link) {
    return URL_REGEX.test(link);
}

/**
 * [isInternal  find if link is internal]
 * @param  {[string]} link [link to test]
 * @return Boolean       [true, if link is internal one]
 */
function isInternal(link) {
    return !isExternal(link);
}

/**
 * [filter Array of string(links) with fn]
 * @param  {[Array]}   links [array of urls]
 * @param  {Function} fn    [function accept string and return true/false]
 * @return {[promise]}         [resolve with array of strings which pass fn or empty array[]]
 */
function filter(links, fn) {
    return when.promise(function(resolve, reject) {
        when.filter(links, fn).then(function(matches) {
            return resolve(matches);
        }).otherwise(function(err) {
            return resolve([]);
        })
    });
}

/**
 * [gather information about https support of a link]
 * check if link support https by hitting the https version of the url with get request
 * get request used instead of head, because sometimes 405 (method not allowed) returns
 * @param  {[URL]} link [a link to check if https version of it, is available]
 * @return [Object]        [object contain the link it self, and https with (support/not supported) + reason]
 * reasons for 'not supported':
 *  any HTTP Error code i.e ETIMEDOUT, ECONNREFUSED, ECONNRESET, EPROTO
 *  UNTRUSTEDCERT: self signed certificate found
 *  UNKNOWN: failover value
 * @example
 * {
 *  link: 'https://google.com',
 *  https: 'supported'
 * }
 * @example
 * {
 *  link: 'https://tether.io',
 *  https: 'not supported',
 *  reason: 'UNTRUSTEDCERT'
 * }
 */
function httpsInfo(link) {
    return when.promise(function(resolve, reject) {
        let https_link = link.replace(/^http:\/\//i, 'https://');
        request.get({
            url: https_link,
            timeout: 2 * 1024
        }, function(error, response) {
            if (error || response.statusCode !== 200) {
                let reason;
                if (response) {
                    reason = response.statusCode;
                } else if (error && error.code) {
                    reason = error.code;
                } else if (error.reason) {
                    reason = 'UNTRUSTEDCERT';
                } else {
                    reason = 'UNKNOWN';
                }
                return resolve({
                    link: link,
                    https: 'not supported',
                    reason: reason
                });
            } else {
                return resolve({
                    link: link,
                    https: 'supported'
                });
            }
        });
    });
}

/**
 * [extract hypermedia external/internal from a page]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @param  {[boolean]} check_https_support [add https support info to external urls]
 * @return {[promise]}   [resolve with object contain external/internal links with their count]
 */
function extract($, check_https_support) {
    return when.promise(function(resolve, reject) {

        let $links = $('a[href]').map(function(i, el) {
            return $(el).attr('href');
        }).get();

        var unique = $links.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });

        $links = unique;

        when.join(filter($links, isExternal), filter($links, isInternal)).then(function(results) {

            let external_urls = results[0];
            let internal_urls = results[1];

            let res = {
                external: {
                    links: external_urls,
                    count: external_urls.length
                },
                internal: {
                    links: internal_urls,
                    count: internal_urls.length
                }
            };

            if (check_https_support) { // add https info to external urls
                let promises = [];
                for (let i = 0; i < external_urls.length; i++) {
                    promises.push(httpsInfo(external_urls[i]));
                }
                when.all(promises).then(function(external_urls_with_https_info) {
                    res.external = {
                        links: external_urls_with_https_info,
                        count: external_urls_with_https_info.length
                    };
                    return resolve(res);
                });
            } else {
                return resolve(res);
            }
        });
    });
}

module.exports = {
    extract: extract
}
