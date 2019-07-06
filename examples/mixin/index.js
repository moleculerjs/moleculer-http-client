"use strict";

let { ServiceBroker } = require("moleculer");
let MyService = require("../../index");
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
      includeMethods: ["get"]
    }
  },

  actions: {
    async get() {
      try {
        let res = await this._get("http://httpbin.org/status/400", {
          json: true
        });

        return res.body;
      } catch (error) {
        // console.log(error);
        throw "ERRROR";
      }
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
    .then(broker.logger.info)
    .catch(broker.logger.error);
});
