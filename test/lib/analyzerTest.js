var should = require('should'),
    nock = require('nock'),
    analyzer = require('../../lib/analyzer');

var github = nock('http://github.com')
    .get('/login')
    .reply(200, '<html><head></head><body></body></html>');

var notexisted = nock('http://example.com')
    .get('/notexisted')
    .reply(404);

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
});
