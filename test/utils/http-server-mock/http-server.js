/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-got)
 * MIT Licensed
 */
"use strict";

const ApiGateway = require("moleculer-web");
const fs = require("fs");

module.exports = {
  name: "api",
  mixins: [ApiGateway],

  // More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
  settings: {
    port: 4000,

    routes: [
      {
        path: "/status",
        bodyParsers: { json: true },

        aliases: {
          "GET /:statusCode": "api.statusCode"
        }
      },
      {
        path: "/json",
        bodyParsers: { json: true },

        aliases: {
          "GET /": "api.get",
          "POST /": "api.post",
          "PUT /": "api.put",
          "DELETE /:id": "api.delete"
        }
      },
      {
        path: "/stream",
        // Disable body parsers for streams
        bodyParsers: {
          json: false,
          urlencoded: false
        },

        aliases: {
          "GET /": "api.getStream",
          "POST /": "stream:api.postStream"
        }
      }
    ]
  },

  actions: {
    /**
     *
     * HTTP HEADERS RELATED ACTIONS
     *
     */
    statusCode(ctx) {
      // Set HTTP headers
      // https://moleculer.services/docs/0.13/moleculer-web.html#Response-type-amp-status-code
      ctx.meta.$statusCode = ctx.params.statusCode;

      return { statusCodeReceived: ctx.params.statusCode };
    },
    /**
     *
     * JSON RELATED ACTIONS
     *
     */
    get(ctx) {
      return { hello: 200 };
    },
    post(ctx) {
      return { id: 123 };
    },
    put(ctx) {
      ctx.meta.$statusCode = 200;

      return { updated: "something" };
    },
    delete(ctx) {
      ctx.meta.$statusCode = 200;

      return { deleted: "something", id: Number(ctx.params.id) };
    },

    /**
     * STREAMING RELATED ACTIONS
     */
    getStream(ctx) {
      ctx.meta.$responseType = "text/plain";
      ctx.meta.$responseHeaders = {
        "Content-Disposition": `attachment; filename=$README.md`
      };

      return fs.createReadStream("./README.md");
    },
    postStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(`./test/utils/stream-data/file.md`);

        stream.on("close", async () => {
          resolve({ fileName: `file.md` });
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
};
