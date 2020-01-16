"use strict";

const { ServiceBroker } = require("moleculer");
const MethodSelector = require("./method-selector.mixin");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  mixins: [MethodSelector(["get", "post"])],

  settings: {
    // Only GET the body of the response
    httpClient: { responseFormatter: "body" }
  },

  actions: {
    post: false
  }
});

// Start the broker
broker.start().then(() => {
  broker.repl();
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://httpbin.org/json",
      opt: { responseType: "json" }
    })
    .then(res => broker.logger.info(res))
    .catch(error => broker.logger.error(error));
});
