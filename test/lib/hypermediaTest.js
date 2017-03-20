var should = require('should'),
    nock = require('nock'),
    cheerio = require('cheerio'),
    hypermedia = require('../../lib/hypermedia');

var HTML_PAGE_WITH_EXTERNAL_LINKS = `<html><head></head><body><a href="https://github.com/">github</a></body></html>`
var HTML_PAGE_WITH_INTTERNAL_LINKS = `<html><head></head><body><a href="/meinung/">meinung</a></body></html>`
var HTML_PAGE_WITH_MIXED_LINKS =
    `<html>
    <head></head>
      <body>
        <a href="https://github.com/">github</a>
        <a href="https://google.com/">google</a>
        <a href="/meinspiegel/">meinspiegel</a>
        <a href="/meinung/">meinung</a>
      </body>
    </html>`;


describe('hypermedia', function() {
    describe('extract', function() {
        it('external links', function(done) {
            hypermedia.extract(cheerio.load(HTML_PAGE_WITH_EXTERNAL_LINKS), false).then(function(results) {
                results.external.links.should.containEql("https://github.com/");
                results.external.count.should.eql(1);
                results.internal.count.should.eql(0);
                done();
            });
        });

        it('internal links', function(done) {
            hypermedia.extract(cheerio.load(HTML_PAGE_WITH_INTTERNAL_LINKS), false).then(function(results) {
                results.internal.links.should.containEql("/meinung/");
                results.internal.count.should.eql(1);
                results.external.count.should.eql(0);
                done();
            });
        });

        it('mixed links types', function(done) {
            hypermedia.extract(cheerio.load(HTML_PAGE_WITH_MIXED_LINKS), false).then(function(results) {
                results.external.links.should.be.instanceof(Array).and.have.lengthOf(2);
                results.external.links.should.containEql("https://google.com/");
                results.external.links.should.containEql("https://github.com/");
                results.external.count.should.eql(2);

                results.internal.links.should.be.instanceof(Array).and.have.lengthOf(2);
                results.internal.links.should.containEql("/meinspiegel/");
                results.internal.links.should.containEql("/meinung/");
                results.internal.count.should.eql(2);

                done();
            });
        });

        it('external links with https support checking', function(done) {
            hypermedia.extract(cheerio.load(HTML_PAGE_WITH_EXTERNAL_LINKS), true).then(function(results) {
                results.external.links.should.containEql({
                    link: 'https://github.com/',
                    https: 'supported'
                });
                results.external.count.should.eql(1);
                results.internal.count.should.eql(0);
                done();
            });
        });

        it('mixed links types with https support checking', function(done) {
            hypermedia.extract(cheerio.load(HTML_PAGE_WITH_MIXED_LINKS), true).then(function(results) {
                results.external.links.should.be.instanceof(Array).and.have.lengthOf(2);
                results.external.links.should.containEql({
                    link: 'https://google.com/',
                    https: 'supported'
                });
                results.external.links.should.containEql({
                    link: 'https://github.com/',
                    https: 'supported'
                });
                results.external.count.should.eql(2);

                results.internal.links.should.be.instanceof(Array).and.have.lengthOf(2);
                results.internal.links.should.containEql("/meinspiegel/");
                results.internal.links.should.containEql("/meinung/");
                results.internal.count.should.eql(2);

                done();
            });
        });
    });
});
