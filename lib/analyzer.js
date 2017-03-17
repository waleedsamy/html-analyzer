'use strict';
var cheerio = require('cheerio'),
    request = require('request'),
    when = require('when');

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
            return resolve(body);
        });
    });
}

module.exports = {
    load: load
}
