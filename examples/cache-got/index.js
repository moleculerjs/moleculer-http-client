"use strict";

const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");
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
