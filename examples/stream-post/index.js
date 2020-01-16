"use strict";

const { ServiceBroker } = require("moleculer");
const HTTPClientService = require("../../index");
const ApiGateway = require("moleculer-web");
const fs = require("fs");

// Create broker
let broker = new ServiceBroker({
  nodeID: "http-client"
});

// Create a HTTP Client Service
broker.createService({
  name: "http",

  // Load HTTP Client Service
  mixins: [HTTPClientService]
});

// Create HTTP Server Service
broker.createService({
  name: "api",
  mixins: [ApiGateway],
  settings: {
    port: 4000,
    routes: [
      {
        path: "/stream",
        bodyParsers: { json: false, urlencoded: false },
        aliases: { "POST /": "stream:api.postStream" }
      }
    ]
  },

  actions: {
    postStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(
          "./examples/stream-post/stored-data.md"
        );

        stream.on("close", async () => {
          resolve({ fileName: `file.md`, method: "POST" });
        });

        // Return error to the user
        stream.on("error", err => {
          reject(err);
        });

        // Pipe the data
        ctx.params.pipe(stream);
      });
    }
  }
});

// Start the broker
broker.start().then(() => {
  const streamFile = "./examples/stream-post/data-to-stream.md";
  const stream = fs.createReadStream(streamFile, { encoding: "utf8" });

  // Pass stream as ctx.params
  // Pass URL and options in ctx.meta
  const req = broker.call("http.post", stream, {
    meta: { url: "http://localhost:4000/stream", isStream: true }
  });

  req.then(res => {
    broker.logger.info(res.statusCode);
  }).then(() => broker.stop());
});
