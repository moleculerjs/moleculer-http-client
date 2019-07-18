![Moleculer logo](http://moleculer.services/images/banner.png)

[![Build Status](https://travis-ci.org/AndreMaz/moleculer-http-client.svg?branch=master)](https://travis-ci.org/AndreMaz/moleculer-http-client) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/AndreMaz/moleculer-http-client/master/LICENSE) [![npm](https://img.shields.io/npm/v/moleculer-http-client.svg)](https://www.npmjs.com/package/moleculer-http-client) [![Downloads](https://img.shields.io/npm/dm/moleculer-http-client.svg)](https://www.npmjs.com/package/moleculer-http-client)

# moleculer-http-client

A tiny wrapper around [got](https://github.com/sindresorhus/got) HTTP client that allows [Moleculer](https://moleculer.services/) services to communicate with REST APIs.

  - [Usage](#Usage)
    - [Actions](#Actions)
    - [Events](#Methods)
    - [Stream](#Stream)
    - [Cache](#Cache)
  - [Service Settings](#Service-Settings)
  - [Service Actions](#Service-Actions)
  - [Service Methods](#Service-Methods)
  - [Customization](#Customization)
    - [Log Messages](#Log-Messages)
    - [Errors](#Errors)

## Features

- Make HTTP requests from Actions and Events
- Stream data
- Cache data
- Customizable log messages and errors

## Install
```
npm install moleculer-http-client --save
```

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
  mixins: [HTTPClientService],
  
  settings: {
    // Only load HTTP GET action
    httpClient: { includeMethods: ["get"] }
  }
});

// Start the broker
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
      // Make a request
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
    // Emit an event
    .emit("some.Event", {
      url: "https://httpbin.org/json",
      opt: { json: true }
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
  mixins: [HTTPClientService],

  settings: {
    // Only load HTTP GET action
    httpClient: { includeMethods: ["get"] }
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://sindresorhus.com/",
      opt: { stream: true }
    })
    .then(res => {
      const filePath = "./examples/stream/file.md";
      // Write stream into file
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
  mixins: [HTTPClientService],

  settings: {
    // Only load HTTP GET action
    httpClient: { includeMethods: ["post"] }
  }
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
    meta: { url: "http://localhost:4000/stream", stream: true }
  });

  req.then(res => {
    broker.logger.info(res.statusCode);
  });
});
```

## Cache
### Moleculer Cache
If you are using [actions](#Service-Actions) to make HTTP requests then you can use [Moleculer's cache](https://moleculer.services/docs/0.13/caching.html) to cache responses.

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

// Start the broker
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
**Result**
```bash
            INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/json"
            INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/json" returned with status code 200
Request ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
Cache   ->  INFO  http-client/BROKER: { slideshow: { author: 'Yours Truly', date: 'date of publication', slides: [ [Object], [Object] ], title: 'Sample Slide Show' } }
```

### Got's Cache
If you are using [methods](#Service-Methods) or you care about `Cache-Control` header option then you should use [Got's cache](https://github.com/sindresorhus/got#cache-1).

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
    // Only load HTTP GET action
    httpClient: {
      includeMethods: ["get"],

      defaultOptions: {
        // Set Got's built-in cache
        // More info: https://github.com/sindresorhus/got#cache-1
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

**Result**
```bash
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/cache/150"
INFO  http-client/HTTP: <= HTTP GET to "https://httpbin.org/cache/150" returned with status code 200
INFO  http-client/BROKER: false
INFO  http-client/HTTP: => HTTP GET to "https://httpbin.org/cache/150"
INFO  http-client/HTTP: **CACHED** HTTP GET to "https://httpbin.org/cache/150" returned with status code 200
INFO  http-client/BROKER: true
```

## Service Settings
```js
module.exports = {
  name: "http",
  
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
Use `includeMethods` field in service settings to create the desired service actions.

> **Note:** By default no actions are created. This is done to avoid any potential conflicts with other service actions when `moleculer-http-client` is used as a mixin.

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


## Customization
### Log Messages
```js
    const service = broker.createService({
      name: "http",

      mixins: [MoleculerHTTP],

      settings: {
        httpClient: {
          includeMethods: ["get"],

          // Input is Got's options object. More info: https://github.com/sindresorhus/got#options
          logOutgoingRequest: options => {
            console.log(`-----> Request ${options.href}`);
          },

          // Input is Got's response object: More info: https://github.com/sindresorhus/got#response
          logIncomingResponse: response => {
            console.log(`<----- Request ${response.statusCode}`);
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
          includeMethods: ["get"],

          // Custom error handler function
          // Input error is Got's error. More info: https://github.com/sindresorhus/got#errors 
          errorFormatter: error => {
            return new Error("Custom Error");
          }
        }
      }
    });
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
