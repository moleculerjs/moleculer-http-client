/*
 * moleculer-http-client
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
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
          "GET /:statusCode": "api.statusCode",
          "POST /:statusCode": "api.statusCode",
          "PUT /:statusCode": "api.statusCode",
          "PATCH /:statusCode": "api.statusCode",
          "DELETE /:statusCode": "api.statusCode"
        }
      },
      {
        path: "/json",
        bodyParsers: { json: true },

        aliases: {
          "GET /": "api.get",
          "POST /": "api.post",
          "PUT /": "api.put",
          "PATCH /": "api.patch",
          "DELETE /:id": "api.delete"
        }
      },
      {
        path: "/cache",
        bodyParsers: { json: true },

        aliases: {
          "GET /": "api.getCache"
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
          "POST /": "stream:api.postStream",
          "PUT /": "stream:api.putStream",
          "PATCH /": "stream:api.patchStream"
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

      return { statusCodeReceived: Number(ctx.params.statusCode) };
    },
    /**
     *
     * JSON RELATED ACTIONS
     *
     */
    get(ctx) {
      return { hello: 200 };
    },
    getCache(ctx) {
      ctx.meta.$responseHeaders = {
        "Cache-Control": `public, max-age=120`
      };

      return { cache: 200 };
    },
    post(ctx) {
      ctx.meta.$statusCode = 200;

      return { id: 123, data: ctx.params.data };
    },
    put(ctx) {
      ctx.meta.$statusCode = 200;

      return { updated: "something" };
    },
    patch(ctx) {
      ctx.meta.$statusCode = 200;

      return { patched: "something" };
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

      return fs.createReadStream("././test/utils/http-server-mock/toStream.md");
    },
    postStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(
          `./test/utils/http-server-mock/POSTfile.md`
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
    },
    putStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(
          `./test/utils/http-server-mock/PUTfile.md`
        );

        stream.on("close", async () => {
          resolve({ fileName: `file.md`, method: "PUT" });
        });

        // Return error to the user
        stream.on("error", err => {
          reject(err);
        });

        // Pipe the data
        ctx.params.pipe(stream);
      });
    },
    patchStream(ctx) {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(
          `./test/utils/http-server-mock/PATCHfile.md`
        );

        stream.on("close", async () => {
          resolve({ fileName: `file.md`, method: "PATCH" });
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
