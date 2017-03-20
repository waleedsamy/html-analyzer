'use strict';
var express = require('express'),
    cluster = require('cluster'),
    prom = require('prom-client'),
    bodyParser = require('body-parser'),
    when = require('when'),
    winston = require('./logger'),
    analyzer = require('./lib/analyzer'),
    urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

const HTTP_REQUESTS_TOTAL = 'http_requests_total';

var httpRequestsTotal = new prom.Counter(HTTP_REQUESTS_TOTAL, 'count of http requests', ['code', 'method']);

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    logger.info('Master cluster setting up %s workers...', numWorkers);

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        logger.info('Worker %s is online', worker.process.pid);
    });

    cluster.on('exit', function(worker, code, signal) {
        logger.alert('Worker %s died with code: %s, and signal', worker.process.pid, code, signal);
        logger.alert('Starting a new worker');
        cluster.fork();
    });
} else {
    var app = express();
    app.use(express.static('public'))

    app.post('/', urlencodedParser, function(req, res) {
        if (!req.body || !req.body.url) {
            httpRequestsTotal.inc({
                code: 400,
                method: 'post'
            });
            return res.status(400).json({
                msg: 'Body paremter url is missing!'
            });
        }

        if (req.body.checkhttps) {
            req.body.checkhttps = (req.body.checkhttps === 'true');
        }

        analyzer.load(req.body.url).then(function($) {
            when.all([
                analyzer.extractHtmlVersion($),
                analyzer.extractPageTitle($),
                analyzer.extractHeadings($),
                analyzer.extractHypermediaLinks($, req.body.checkhttps),
                analyzer.containsLoginForm($)
            ]).then(function(results) {
                httpRequestsTotal.inc({
                    code: 200,
                    method: 'post'
                });
                res.status(200).json({
                    msg: 'html-analyzer, source available at https://github.com/waleedsamy/html-analyzer',
                    url: req.body.url,
                    html_version: results[0],
                    title: results[1],
                    headings: results[2],
                    links: results[3],
                    loginFormFound: results[4]
                });
            });
        }).otherwise(function(err) {
            httpRequestsTotal.inc({
                code: 501,
                method: 'post'
            });
            res.status(501).json({
                msg: err,
                url: req.body.url
            });
        });
    });


    app.get('/metrics', function(req, res) {
        res.end(prom.register.metrics());
    });

    app.listen(3000, function() {
        logger.alert('Service starting', {
            host: 'localhost',
            port: 3000
        });
    });
}
