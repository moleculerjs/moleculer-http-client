"use strict";

const { ServiceBroker } = require("moleculer");
// const HTTPClientService = require("../../index");
const Filter = require("./method-selector.mixin");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  // mixins: [HTTPClientService],

  mixins: [Filter(["get", "post"])],

  settings: {
    // Only load HTTP GET action
    httpClient: { responseFormatter: "body" }
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
    .then(res => broker.logger.info(res))
    .catch(error => broker.logger.error(error));
});
