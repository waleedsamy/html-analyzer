'use strict';
var express = require('express'),
    prom = require('prom-client'),
    bodyParser = require('body-parser'),
    winston = require('./logger'),
    analyzer = require('./lib/analyzer'),
    app = express(),
    urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

const HTTP_REQUESTS_TOTAL = 'http_requests_total';

var httpRequestsTotal = new prom.Counter(HTTP_REQUESTS_TOTAL, 'count of http requests', ['code', 'method']);


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

    analyzer.load(req.body.url).then(function(html) {
        httpRequestsTotal.inc({
            code: 501,
            method: 'post'
        });
        res.status(501).json({
            msg: 'html-analyzer to be build...',
            url: req.body.url,
            html: html
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
})
