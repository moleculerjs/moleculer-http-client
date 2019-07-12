![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-http-client [![Build Status](https://travis-ci.org/AndreMaz/moleculer-http-client.svg?branch=master)](https://travis-ci.org/AndreMaz/moleculer-http-client)

A tiny wrapper around [got](https://github.com/sindresorhus/got) HTTP client that allows Moleculer services to communicate with REST APIs.

## Features

## Install
```
npm install moleculer-http-client --save
```
## Usage

**Example**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Create broker
let broker = new ServiceBroker({
  namespace: 'client',
  nodeID: "namespace"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service  
  mixins: [HTTPClientService],
  
  settings: {
    // Only load HTTP action
    got: { includeMethods: ["get"] }
  }
});

// Start server
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/json",
      opt: { json: true }
    })
    .then(res => broker.logger.info(res.body))
    .catch(error => broker.logger.error(error));
});
```

**Result**
```bash
INFO  node/HTTP: => HTTP GET to https://httpbin.org/json
INFO  node/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
INFO  node/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }

```

## Test
```
$ npm test
```

# Contribution

Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples.

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2019 André Mazayev
