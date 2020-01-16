![Moleculer logo](http://moleculer.services/images/banner.png)

[![Build Status](https://travis-ci.org/moleculerjs/moleculer-http-client.svg?branch=master)](https://travis-ci.org/moleculerjs/moleculer-http-client) [![Coverage Status](https://coveralls.io/repos/github/moleculerjs/moleculer-http-client/badge.svg?branch=master)](https://coveralls.io/github/moleculerjs/moleculer-http-client?branch=master) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/moleculerjs/moleculer-http-client/master/LICENSE) [![npm](https://img.shields.io/npm/v/moleculer-http-client.svg)](https://www.npmjs.com/package/moleculer-http-client) [![Downloads](https://img.shields.io/npm/dm/moleculer-http-client.svg)](https://www.npmjs.com/package/moleculer-http-client)

# moleculer-http-client

A tiny wrapper around [got](https://www.npmjs.com/package/got) HTTP client that allows [Moleculer](https://moleculer.services/) services to communicate with REST APIs. Why got? Because [reasons](https://github.com/sindresorhus/got#comparison).

  - [Service Settings](#service-settings)
  - [Service Actions](#service-actions)
  - [Service Methods](#service-methods)
  - [Usage](#usage)
    - [Actions](#actions)
    - [Events](#events)
    - [Stream](#stream)
    - [Cache](#cache)
    - [Got Instance](#got-instance)
  - [Customization](#customization)
    - [Log Messages](#log-messages)
    - [Errors](#errors)

## Features

- Make HTTP requests from Actions and Events
- Stream data
- Cache data
- Customizable log messages and errors

## Install
```
npm install moleculer-http-client --save
```

## Service Settings
Use `httpClient` field to configure your got client.

```js
module.exports = {
  name: "http",
  
  /**
   * Moleculer settings
   */
  settings: {
    // HTTP client settings
    httpClient: {
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

## `get`
HTTP GET action

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |

### Returns
**Type:** `Promise`, `Stream`

## `post` 

HTTP POST action

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

> **Note:** When streaming use `ctx.meta` to pass `url` and `opt` and `ctx.params` to pass stream data

### Returns
**Type:** `Promise`

## `put` 

HTTP PUT action

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

> **Note:** When streaming use `ctx.meta` to pass `url` and `opt` and `ctx.params` to pass stream data

### Returns
**Type:** `Promise`

## `patch` 

HTTP PATCH action

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

> **Note:** When streaming use `ctx.meta` to pass `url` and `opt` and `ctx.params` to pass stream data

### Returns
**Type:** `Promise`

## `delete` 

HTTP DELETE action

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

> **Note:** When streaming use `ctx.meta` to pass `url` and `opt` and `ctx.params` to pass stream data

### Returns
**Type:** `Promise`

## Service Methods
## `_get` 

HTTP GET method

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |

### Returns
**Type:** `Promise`, `Stream`

## `_post` 

HTTP POST method

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

### Returns
**Type:** `Promise`


## `_put` 

HTTP PUT method

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

### Returns
**Type:** `Promise`


## `_patch` 

HTTP PATCH method

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |
| `streamPayload` | `Stream`| **optional** | Stream payload |

### Returns
**Type:** `Promise`

## `_delete` 

HTTP DELETE method

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `url` | `String`| **required** | URL |
| `opt` | `Object`| **optional** | [Request options](https://www.npmjs.com/package/got#options) |

### Returns
**Type:** `Promise`

# Usage
## Actions
**Action Example**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");

// Create broker
let broker = new ServiceBroker();

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service  
  mixins: [HTTPClientService]
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/json",
      opt: { responseType: "json" }
    })
    .then(res => broker.logger.info(res))
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
const HTTPClientService = require("moleculer-http-client");

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
      // Use service method to make a request
      const res = await this._get(request.url, request.opt);
      this.logger.info("Printing Payload");
      // Print the response data
      this.logger.info(res.body);
    }
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Emit some event
    .emit("some.Event", {
      url: "https://httpbin.org/json",
      opt: { responseType: "json" }
    });
});
```

**Result**
```bash
INFO  http-client/HTTP: Caught an Event
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
INFO  http-client/HTTP: Printing Payload
INFO  http-client/HTTP: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

## Stream
### GET Stream
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");
const fs = require("fs");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService]
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://sindresorhus.com/",
      opt: { isStream: true }
    })
    .then(res => {
      const filePath = "./examples/stream-get/file.md";
      res.pipe(fs.createWriteStream(filePath, { encoding: "utf8" }));

      res.on("response", response => {
        broker.logger.info(response.statusCode);
      });
    })
    .catch(error => broker.logger.error(error));
});
```

### POST Stream
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");
const ApiGateway = require("moleculer-web");
const fs = require("fs");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a HTTP Client Service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService]
});

// Create HTTP Server Services
broker.createService({
  name: "api",
  mixins: [ApiGateway],
  settings: {
    port: 4000,
    routes: [
      {
        path: "/stream",
        bodyParsers: { json: false, urlencoded: false },
        aliases: { "POST /": "stream:api.postStream" }
      }
    ]
  },

  actions: {
    postStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(
          "./examples/stream-post/stored-data.md"
        );

        stream.on("close", async () => {
          resolve({ fileName: `file.md`, method: "POST" });
        });

        // Return error to the user
        stream.on("error", err => {
          reject(err);
        });

        // Pipe the data
        ctx.params.pipe(stream);
      });
    }
  }
});

// Start the broker
broker.start().then(() => {
  const streamFile = "./examples/stream-post/data-to-stream.md";
  const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

  // Pass stream as ctx.params
  // Pass URL and options in ctx.meta
  const req = broker.call("http.post", stream, {
    meta: { url: "http://localhost:4000/stream", isStream: true }
  });

  req.then(res => {
    broker.logger.info(res.statusCode);
  });
});
```

## Cache
### Moleculer Cache
If you are using [actions](#service-actions) to make HTTP requests then you can use [Moleculer's cache](https://moleculer.services/docs/0.13/caching.html) to cache responses.

> Please note that when using Moleculer's cache you will be ignoring [`Cache-Control` header field](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). If you care about `Cache-Control` then you should use [Got's cache](#gots-cache).


**Example of Moleculer Cache**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");

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

  actions: {
    get: {
      // Enable cache for GET action
      // More info: https://moleculer.services/docs/0.13/caching.html
      cache: true
    }
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/json",
      opt: { responseType: "json" }
    })
    .then(res => broker.logger.info(res.body))
    .then(() =>
      broker.call("http.get", {
        url: "https://httpbin.org/json",
        opt: { responseType: "json" }
      })
    )
    .then(res => broker.logger.info(res.body))
    .catch(error => broker.logger.error(error));
});
```
**Result**
```bash
            INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
            INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
Request ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
Cache   ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

### Got's Cache
If you are using [methods](#service-methods) or you care about `Cache-Control` header option then you should use [Got's cache](https://www.npmjs.com/package/got#cache-1).

**Example of Got cache**
```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");

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
    httpClient: {
      defaultOptions: {
        // Set Got's built-in cache
        // More info: https://www.npmjs.com/package/got#cache-1
        cache: cacheMap
      }
    }
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/cache/150",
      opt: { responseType: "json" }
    })
    .then(res => broker.logger.info(res.isFromCache))
    .then(() =>
      broker.call("http.get", {
        url: "https://httpbin.org/cache/150",
        opt: { responseType: "json" }
      })
    )
    .then(res => broker.logger.info(res.isFromCache))
    .catch(error => broker.logger.error(error));
});
```

**Result**
```bash
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/cache/150"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/cache/150" returned with status code 200
INFO  http-client/BROKER: false
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/cache/150"
INFO  http-client/HTTP: **CACHED** HTTP GET to "https://httpbin.org/cache/150" returned with status code 200
INFO  http-client/BROKER: true
```

### Got Instance
If you need to do some fancy request (e.g., `HEAD`, `TRACE`, `OPTIONS`) you can directly call the got client available at `_client`.

```js
const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("moleculer-http-client");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService],

  actions: {
    async fancyRequest(ctx) {
      try {
        // Direct call to Got Client
        // Can be any Got supported HTTP Method
        return await this._client(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw error;
      }
    }
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a fancy request
    .call("http.fancyRequest", {
      url: "https://httpbin.org/json",
      opt: { method: "GET", responseType: "json" }
    })
    .then(res => broker.logger.info(res.body))
    .catch(error => broker.logger.error(error));
});
```

```bash
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

## Customization
### Log Messages
```js
    const service = broker.createService({
      name: "http",

      mixins: [MoleculerHTTP],

      settings: {
        httpClient: {
          // Input is Got's options object. More info: https://www.npmjs.com/package/got#options
          logOutgoingRequest: options => {
            console.log(`-----> Request ${options.href}`);
          },

          // Input is Got's response object: More info: https://www.npmjs.com/package/got#response
          logIncomingResponse: response => {
            console.log(`<----- Response Status Code ${response.statusCode}`);
          }
        }
      }
    });
```

### Errors
```js
    const service = broker.createService({
      name: "http",

      mixins: [MoleculerHTTP],

      settings: {
        httpClient: {
          // Custom error handler function
          // Input error is Got's error. More info: https://www.npmjs.com/package/got#errors
          errorFormatter: error => {
            return new Error("Custom Error");
          }
        }
      }
    });
```

## Test
```bash
$ npm test
```

# Contribution

Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples.

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2016-2020 MoleculerJS

[![@moleculerjs](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS) 
