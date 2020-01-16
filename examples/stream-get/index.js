"use strict";

const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");
const fs = require("fs");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService]
});

// Start the broker
broker.start().then(() => {
  broker
    // Make a HTTP GET request
    .call("http.get", {
      url: "https://sindresorhus.com/",
      opt: { isStream: true }
    })
    .then(res => {
      const filePath = "./examples/stream-get/file.md";
      res.pipe(fs.createWriteStream(filePath, { encoding: "utf8" }));

      res.on("response", response => {
        broker.logger.info(response.statusCode);
      });
    })
    .catch(error => broker.logger.error(error));
});
