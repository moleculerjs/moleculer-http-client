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
  name: "gotMixed",

  mixins: [MyService],

  settings: {
    got: {
      logging: false,
      includeMethods: ["get", "post"],
      defaultOptions: {}
    }
  },

  actions: {
    async get() {
      try {
        console.log(this.settings.got.defaultOptions);

        /*
        let res = await this._get("http://httpbin.org/status/200", {
          json: true
        });
        */

        return this.settings.got.defaultOptions;
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

// Start server
broker.start().then(() => {
  // Call action
  // broker.repl();
  broker
    .call("gotMixed.get", { name: "John MIXIN Doe" })
    .then()
    .catch(broker.logger.error);
});
