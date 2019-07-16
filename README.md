![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-http-client [![Build Status](https://travis-ci.org/AndreMaz/moleculer-http-client.svg?branch=master)](https://travis-ci.org/AndreMaz/moleculer-http-client)

[WIP] A tiny wrapper around [got](https://github.com/sindresorhus/got) HTTP client that allows [Moleculer](https://moleculer.services/) services to communicate with REST APIs.

## Features

- Make HTTP requests from Actions and Events
- Stream data
- Cache data
- Customizable log messages and errors

## Install
```
npm install moleculer-http-client --save
```

## Actions
**Action Example**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Create broker
let broker = new ServiceBroker();

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service  
  mixins: [HTTPClientService],
  
  settings: {
    // Only load HTTP GET action
    httpClient: { includeMethods: ["get"] }
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
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

## Events
**Event Example**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Create broker
let broker = new ServiceBroker();

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService],

  events: {
    // Register an event listener
    async "some.Event"(request) {
      this.logger.info("Caught an Event");
      // Make a request
      const res = await this._get(request.url, request.opt);
      this.logger.info("Printing Payload");
      // Print the response data
      this.logger.info(res.body);
    }
  }
});

// Start server
broker.start().then(() => {
  broker
    // Emit an event
    .emit("some.Event", {
      url: "https://httpbin.org/json",
      opt: { json: true }
    });
});
```

```bash
INFO  http-client/HTTP: Caught an Event
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
INFO  http-client/HTTP: Printing Payload
INFO  http-client/HTTP: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

## Cache
### Moleculer Cache
**Example of Moleculer Cache**
If you are making HTTP requests from Moleculer's [actions](#Service-Actions) then you can use [Moleculer's cache](https://moleculer.services/docs/0.13/caching.html) to cache responses.
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client",
  // Enable Moleculer Cache
  cacher: "Memory"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService],

  settings: {
    // Only load HTTP GET action
    httpClient: { includeMethods: ["get"] }
  },

  actions: {
    get: {
      // Enable cache for GET action
      // More info: https://moleculer.services/docs/0.13/caching.html
      cache: true
    }
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
    .then(() =>
      broker.call("http.get", {
        url: "https://httpbin.org/json",
        opt: { json: true }
      })
    )
    .then(res => broker.logger.info(res.body))
    .catch(error => broker.logger.error(error));
});
```

```bash
            INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
            INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
Request ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
Cache   ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

### Got's Cache
If you are using only the [methods](#Service-Methods) then you should use [Got's cache](https://github.com/sindresorhus/got#cache-1).

**Example of Got Cache**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Using JS Map as cache
const cacheMap = new Map();

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService],

  settings: {
    // Only load HTTP GET action
    httpClient: {
      includeMethods: ["get"],
      logging: false,
      defaultOptions: {
        // Set Got's built-in cache
        // More info: https://github.com/sindresorhus/got#cache-1
        cache: cacheMap
      }
    }
  }
});

// Start server
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/cache/150",
      opt: { json: true }
    })
    .then(res => broker.logger.info(res.fromCache))
    .then(() =>
      broker.call("http.get", {
        url: "https://httpbin.org/cache/150",
        opt: { json: true }
      })
    )
    .then(res => broker.logger.info(res.fromCache))
    .catch(error => broker.logger.error(error));
});
```

```bash
Request ->  INFO  http-client/BROKER: false
Cache   ->  INFO  http-client/BROKER: true
```

## Service Configs
```js
module.exports = {
  name: "http",

   /**
    * Raw Got Client instance https://github.com/sindresorhus/got#instances
    * Created with `httpClient` settings
    */
  _client: null,

  /**
   * Default settings
   */
  settings: {
    httpClient: {
      // HTTP methods to include as Moleculer Actions
      includeMethods: null, // ['get', 'post', 'put', 'patch', 'delete' ]

      // Boolean value indicating whether request should be logged or not
      logging: true,

      // Log request function
      logOutgoingRequest: logOutgoingRequest,

      // Log response function
      logIncomingResponse: logIncomingResponse,

      // Format the Response
      responseFormatter: "body", // one of "body", "headers", "status", "raw"

      // Format the Errors
      errorFormatter: errorFormatter,

      // Got Client options
      defaultOptions: {
        // Put here any Got available option that can be used to extend Got client
      }
    }
  },
};
```

## Service Actions

```js
// ToDo
```

## Service Methods
```js
// ToDo
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
