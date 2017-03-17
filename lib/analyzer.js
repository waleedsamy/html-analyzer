'use strict';
var cheerio = require('cheerio'),
    request = require('request'),
    when = require('when');

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
    ];

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
 * @param  {[string]} html [page html content]
 * @return {[promise]}      [resolve with HTML version, or rejected with Undetected/UNIDENTFIED html version ]
 */
function extractHtmlVersion(html) {
    return when.promise(function(resolve, reject) {
        var doctype = html.match(DOCTYPE_REGEX)[0].trim();
        if (!doctype) {
            return reject('Undetected html version');
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

        return reject(`UNIDENTFIED doctype ${doctype}`);
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

module.exports = {
    load: load,
    extractHtmlVersion: extractHtmlVersion,
    extractPageTitle: extractPageTitle
}
