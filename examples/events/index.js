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

  events: {
    // Register an event listener
    async "some.Event"(request) {
      this.logger.info("Caught an Event");
      // Make a request
      const res = await this._get(request.url, request.opt);
      this.logger.info("Printing Payload");
      // Print the incoming payload
      this.logger.info(res.body);
    }
  }
});

// Start server
broker.start().then(() => {
  broker
    // Emit some event
    .emit("some.Event", {
      url: "https://httpbin.org/json",
      opt: { json: true }
    });
});
