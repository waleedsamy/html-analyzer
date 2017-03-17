# html-analyzer
> Service to provide statistics about html page content


#### Development
```bash
  $ npm install -g yarn
  $ yarn install
  $ npm test
  $ npm start
```

##### Information will be provided by the service
 * HTML version of the document
 * Page title, if any
 * Number of heading grouped by heading level
 * Number of hypermedia links in the document, grouped by internal and external links according to page domain
 * Does page contain login form?
 * (Optional)provide validation that each collected links is available via HTTP(S), in the case of an unreachable link, provide information about what went wrong
