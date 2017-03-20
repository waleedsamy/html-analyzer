'use strict';
var cheerio = require('cheerio'),
    request = require('request'),
    when = require('when'),
    loginFormDetector = require('./loginFormDetector');

const DOCTYPE_REGEX = /[\s\S]+?(?=<html)/,
    DOC_TYPES = [
        'HTML 4.01 Transitional',
        'HTML 4.01 Frameset',
        'HTML 4.01',
        'HTML 3.2',
        'HTML 2.0',
        'XHTML 1.0 Strict',
        'XHTML 1.0 Transitional',
        'XHTML 1.0 Frameset',
        'XHTML 1.1'
    ],
    URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

/**
 * load html content of url
 * @param  {[string]} url http(s) URL
 * @return {[promise]}     [hrml content of url or reject the promise]
 */
function load(url) {
    return when.promise(function(resolve, reject) {
        request(url, function(error, response, body) {
            // requestjs fellows redirect by default
            if (error || response.statusCode !== 200) {
                return reject(error || `${url} returns ${response.statusCode}`);
            }
            return resolve(cheerio.load(body));
        });
    });
}


/**
 * [extract HTML version based on https://www.w3schools.com/tags/tag_doctype.asp]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @return {[promise]}      [resolve with HTML version, or rejected with Undetected/UNIDENTFIED html version ]
 */
function extractHtmlVersion($) {
    return when.promise(function(resolve, reject) {
        var doctype = $.html().match(DOCTYPE_REGEX)[0].trim();
        if (!doctype) {
            return resolve('UNDETECTED');
        }
        doctype = doctype.toUpperCase();

        if (doctype === '<!DOCTYPE HTML>') {
            return resolve('HTML 5');
        }

        for (let i = 0; i < DOC_TYPES.length; i++) {
            if (doctype.includes(DOC_TYPES[i].toUpperCase())) {
                return resolve(DOC_TYPES[i]);
            }
        }

        return resolve(`UNIDENTFIED`);
    });
}

/**
 * [extract title tage content from head>title tag in html page]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @return {[promise]}   [resolve with title or empty string]
 */
function extractPageTitle($) {
    return when.promise(function(resolve, reject) {
        return resolve($('head > title').text());
    });
}

/**
 * [get number of heading grouped by heading level]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @return {[promise]}   [resolved with with object contain h1...h6 as keys and he count of each heading level in the html ]
 */
function extractHeadings($) {
    return when.promise(function(resolve, reject) {

        let fh = (h) => {
            return when.resolve($(h).toArray().length);
        };

        when.all([fh('h1'), fh('h2'), fh('h3'), fh('h4'), fh('h5'), fh('h6')]).then(function(results) {
            return resolve({
                'h1': results[0],
                'h2': results[1],
                'h3': results[2],
                'h4': results[3],
                'h5': results[4],
                'h6': results[5]
            });
        });
    });
}


/**
 * [extract hypermedia external/internal from a page]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @param  {[boolean]} check_https_support [add https support inf to external url]
 * @return {[promise]}   [resolve with object contain external/internal links with the their count]
 */
function extractHypermediaLinks($, check_https_support) {
    return when.promise(function(resolve, reject) {

        var external = function(link) {
            return URL_REGEX.test(link);
        }

        var internal = function(link) {
            return !external(link);
        }

        /**
         * [filter Array of string(links) with fn]
         * @param  {[Array]}   links [array of urls]
         * @param  {Function} fn    [function accept string and return true/false]
         * @return {[promise]}         [resolve with array of strings which pass fn]
         */
        var filter = function(links, fn) {
            return when.promise(function(resolve, reject) {
                when.filter(links, fn).then(function(externals) {
                    return resolve(externals);
                }).otherwise(function(err) {
                    return resolve([]);
                })
            });
        }

        let $links = $('a[href^="http"]').map(function(i, el) {
            return $(el).attr('href');
        }).get();

        var unique = $links.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });

        $links = unique;

        // check if link support https by hitting the https version of the url with get request
        // head request is not accurate enough, because sometimes 405 (method not allowed) returns
        var supportHTTPS = function(links) {
            let check = function(link) {
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

            var promises = [];
            for (let i = 0; i < links.length; i++) {
                promises.push(check(links[i]));
            }
            return when.all(promises);
        }

        when.join(filter($links, external), filter($links, internal)).then(function(results) {

            let external_urls = results[0];
            let internal_urls = results[1];

            if (check_https_support) {
                supportHTTPS(external_urls).then(function(external_urls_with_https_info) {
                    return resolve({
                        external: {
                            links: external_urls_with_https_info,
                            count: external_urls_with_https_info.length
                        },
                        internal: {
                            links: internal_urls,
                            count: internal_urls.length
                        }
                    });
                });
            } else {
                return resolve({
                    external: {
                        links: external_urls,
                        count: external_urls.length
                    },
                    internal: {
                        links: internal_urls,
                        count: internal_urls.length
                    }
                });
            }
        });
    });
}

module.exports = {
    load: load,
    extractHtmlVersion: extractHtmlVersion,
    extractPageTitle: extractPageTitle,
    extractHeadings: extractHeadings,
    extractHypermediaLinks: extractHypermediaLinks,
    containsLoginForm: loginFormDetector.containsLoginForm
}
