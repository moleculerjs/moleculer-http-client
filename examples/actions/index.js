"use strict";

const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");

// Create broker
let broker = new ServiceBroker({
  logger: console
});

// Load my service
broker.createService({
  name: "http",

  mixins: [HTTPClientService],

  settings: {
    got: { includeMethods: ["get"] }
  }
});

// Start server
broker.start().then(() => {
  broker
    .call("http.get", {
      url: "https://httpbin.org/json",
      opt: { json: true }
    })
    .then(res => broker.logger.info(res.body))
    .catch(error => broker.logger.error(error));
});
