"use strict";

const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

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
    // Only GET the headers of the response
    httpClient: { responseFormatter: "headers" }
    // httpClient: { responseFormatter: "status" } // Return the status code only
  }
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/json"
    })
    .then(res => broker.logger.info(res))
    .catch(error => broker.logger.error(error));
});
