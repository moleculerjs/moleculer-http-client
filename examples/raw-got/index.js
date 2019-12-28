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

  actions: {
    async fancyRequest(ctx) {
      try {
        // Use raw got client
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
