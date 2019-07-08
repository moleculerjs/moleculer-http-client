"use strict";

const { ServiceBroker } = require("moleculer");
const MyService = require("../../index");
const { MoleculerGotError } = require("../../src/errors");

const fs = require("fs");

// Create broker
let broker = new ServiceBroker({
  logger: console
});

// Load my service
let s = broker.createService({
  name: "got",

  mixins: [MyService],

  settings: {
    got: {
      includeMethods: ["get", "post"],
      defaultOptions: {
        logger: "LOOGGGGGGERRRR"
      }
    }
  },

  actions: {
    async get() {
      try {
        let res = await this._get("http://httpbin.org/status/200", {
          json: true
        });

        return res.body;
      } catch (error) {
        // console.log(error);
        throw "Got an ERROR";
      }
    },

    getStream() {
      return new Promise((resolve, reject) => {
        let streamRequest = this._get("https://httpbin.org/html", {
          stream: true
        });

        streamRequest.pipe(fs.createWriteStream("index.html"));

        streamRequest.on("end", () => {
          resolve("done");
        });
      });
    }
  }
});

// console.log(s);

// Start server
broker.start().then(() => {
  // Call action
  // broker.repl();
  broker
    .call("got.get", { name: "John MIXIN Doe" })
    .then()
    .catch(broker.logger.error);
});
