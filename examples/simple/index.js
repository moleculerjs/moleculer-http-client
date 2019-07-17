"use strict";

let { ServiceBroker } = require("moleculer");
let MyService = require("../../index");

// Create broker
let broker = new ServiceBroker({
  logger: console
});

// Load my service
broker.createService(MyService);

// Start the broker
broker.start().then(() => {
  // Call action
  broker
    .call("got.test", { name: "John Doe" })
    .then(broker.logger.info)
    .catch(broker.logger.error);
});
