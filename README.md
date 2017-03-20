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
  # curl -X POST -d 'url=https://www.spiegel.de/meinspiegel/login.html&=' "http://localhost:3000/"
```

#### Run with docker
```bash
  docker build -t waleedsamy/html-analyzer . # or docker pull waleedsamy/html-analyzer
  docker run -d -p 3000:3000 --name analyzer waleedsamy/html-analyzer
  # open your browser at http://localhost:3000/
```

##### Information will be provided by the service
 * HTML version of the document
 * Page title, if any
 * Number of heading grouped by heading level
 * Number of hypermedia links in the document, grouped by internal and external links according to page domain
 * Does page contain login form?
 * provide validation that each collected links is available via HTTP(S), in the case of an unreachable link, provide information about what went wrong
