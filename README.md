# html-analyzer
> Service to provide statistics about html page content

[![Docker Hub](https://img.shields.io/badge/docker-ready-blue.svg)](https://registry.hub.docker.com/u/waleedsamy/html-analyzer/)

#### Development
```bash
  $ npm install -g yarn
  $ yarn install
  $ npm test
  $ npm start
  # open your browser at http://localhost:3000/
  # or call the service directly, use jq https://stedolan.github.io/jq/ for beautiful json
  # curl -X POST -d 'url=https://www.spiegel.de/meinspiegel/login.html&checkhttps=false' "http://localhost:3000/"
```

#### Run with docker
```bash
  docker build -t waleedsamy/html-analyzer . # or docker pull waleedsamy/html-analyzer
  docker run -d -p 3000:3000 --name analyzer waleedsamy/html-analyzer
  # open your browser at http://localhost:3000/
```

#### Information will be provided by the service
 * HTML version of the document
 * Page title, if any
 * Number of heading grouped by heading level
 * Number of hypermedia links in the document, grouped by internal and external links according to page domain
 * Does page contain login form?
 * provide validation that each collected links is available via HTTP(S), in the case of an unreachable link, provide information about what went wrong

#### implementation details
 * promises everywhere, I used [whenjs](https://github.com/cujojs/when) as a A+ promise libarary
 * frontend parts is simple as possible, single html page, no grunt or bower needed. but make sure you have an internet connection for jquery and bootstrap.
 * [prometheus](https://github.com/prometheus/prometheus) metric exposed at `/metrics`, and provide metrics about 200, 400, 501, 502 status code.
 * Login form detection work with all cases, I tested against. it ignore signup/register/join forms.
 * checking https support against external urls, done by sending a `GET` request, I found a lot of sites provide 405(method not allowed) with `HEAD` request.
 * checking https support cost some time, if site page has n external urls, it cost o(n). I had a timeout configured with 2 seconds(should be enough for most cases).
 * docker image available `docker pull waleedsamy/html-analyzer`

#### What to enhance
 * performance enhancing, apache benchmark make it more obvious
  ```bash
    ab -p test/post-no-https-check.data  -T application/x-www-form-urlencoded -c 20 -n 50 http://localhost:3000/
    > Percentage of the requests served within a certain time (ms)
    > 50%    879
    > 66%   1022
    > 75%   1086
    > 80%   1126
    > 90%   1267
    > 95%   1320
    > 98%   1612
    > 99%   1612
    > 100%   1612 (longest request)
    ab -p test/post-no-https-check.data  -T application/x-www-form-urlencoded -c 20 -n 50 http://localhost:3000/
    > 50%    952
    > 66%   1051
    > 75%   1120
    > 80%   1178
    > 90%   1265
    > 95%   1385
    > 98%   1502
    > 99%   1502
    > 100%   1502 (longest request)
  ```
 * add more prometheus metrics, to discover where most of processing happen
 * add nodejs workers
