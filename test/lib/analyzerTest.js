var should = require('should'),
    nock = require('nock'),
    cheerio = require('cheerio'),
    analyzer = require('../../lib/analyzer');

var github = nock('http://github.com')
    .get('/login')
    .reply(200, '<html><head></head><body></body></html>');
var notexisted = nock('http://example.com')
    .get('/notexisted')
    .reply(404);

var HTML5 = `<!DOCTYPE html><html><head></head><body></body></html>`;
var HTML5_ML = `

<!DOCTYPE html>

  <html><head></head><body></body></html>`;
var HTML_4_01_Strict = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html></html>`;
var HTML_4_01_Transitional = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html></html>`;
var HTML_4_01_Frameset = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd"><html></html>`;
var XHTML_1_0_Strict = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html></html>`;
var XHTML_1_0_Transitional = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html></html>`;
var XHTML_1_0_Frameset = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd"><html></html>`;
var XHTML_1_1 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html></html>`;

var HTML_WITH_TITLE = `<html><head><title>title</title></head><body></body></html>`
var HTML_WITH_EMPTY_TITLE = `<html><head><title></title></head><body></body></html>`
var HTML_WITH_NOT_TITLE_TAG = `<html><head></head><body></body></html>`

var HTML_PAGE_WITH_HEADINGS = `<html><head></head><body><h1>h1 1</h1><h1>h1 2</h1><h2>h2</h2><h6>h6</h6><h6>h6</h6><h6>h6</h6></body></html>`

describe('analyzer', function() {
    describe('load', function() {
        it('load valid url', function(done) {
            analyzer.load('http://github.com/login').then(function(html) {
                should.exist(html);
                done();
            });
        });

        it('reject inaccessible url', function(done) {
            analyzer.load('http://example.com/notexisted').otherwise(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    describe('extractHtmlVersion', function() {
        it('detect HTML version when document is minified', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML5)).then(function(doctype) {
                done();
            });
        });

        it('detect HTML version even whin newline exist before or after doctype tag', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML5_ML)).then(function(doctype) {
                done();
            });
        });

        it('detect HTML 5', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML5)).then(function(doctype) {
                doctype.should.be.eql('HTML 5');
                done();
            });
        });

        it('detect HTML 4.01 Strict', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML_4_01_Strict)).then(function(doctype) {
                doctype.should.be.eql('HTML 4.01');
                done();
            });
        });

        it('HTML 4.01 Transitional', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML_4_01_Transitional)).then(function(doctype) {
                doctype.should.be.eql('HTML 4.01 Transitional');
                done();
            });
        });

        it('HTML 4.01 Frameset', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(HTML_4_01_Frameset)).then(function(doctype) {
                doctype.should.be.eql('HTML 4.01 Frameset');
                done();
            });
        });

        it('XHTML 1.0 Strict', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(XHTML_1_0_Strict)).then(function(doctype) {
                doctype.should.be.eql('XHTML 1.0 Strict');
                done();
            });
        });

        it('XHTML 1.0 Transitional', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(XHTML_1_0_Transitional)).then(function(doctype) {
                doctype.should.be.eql('XHTML 1.0 Transitional');
                done();
            });
        });

        it('XHTML 1.0 Frameset', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(XHTML_1_0_Frameset)).then(function(doctype) {
                doctype.should.be.eql('XHTML 1.0 Frameset');
                done();
            });
        });

        it('XHTML 1.1', function(done) {
            analyzer.extractHtmlVersion(cheerio.load(XHTML_1_1)).then(function(doctype) {
                doctype.should.be.eql('XHTML 1.1');
                done();
            });
        });
    });

    describe('extractPageTitle', function() {
        it('extract existed title', function(done) {
            analyzer.extractPageTitle(cheerio.load(HTML_WITH_TITLE)).then(function(title) {
                title.should.be.eql('title');
                done();
            });
        });
        it('handle empty title', function(done) {
            analyzer.extractPageTitle(cheerio.load(HTML_WITH_EMPTY_TITLE)).then(function(title) {
                title.should.be.eql('');
                done();
            });
        });
        it('handle unexisted title tag', function(done) {
            analyzer.extractPageTitle(cheerio.load(HTML_WITH_NOT_TITLE_TAG)).then(function(title) {
                title.should.be.eql('');
                done();
            });
        });
    });

    describe('extractHeadings', function() {
        it('extract all headings', function(done) {
            analyzer.extractHeadings(cheerio.load(HTML_PAGE_WITH_HEADINGS)).then(function(headings) {
                headings.h1.should.be.eql(2);
                headings.h2.should.be.eql(1);
                headings.h3.should.be.eql(0);
                headings.h4.should.be.eql(0);
                headings.h5.should.be.eql(0);
                headings.h6.should.be.eql(3);
                done();
            });
        });
    });

});
