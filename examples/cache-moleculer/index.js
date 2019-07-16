"use strict";

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
