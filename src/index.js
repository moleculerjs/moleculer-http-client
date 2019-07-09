/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-got)
 * MIT Licensed
 */

"use strict";

const got = require("got");
const _ = require("lodash");

const HTTP_METHODS = ["get", "put", "post", "delete"];

const { logOutgoingRequest, logIncomingResponse } = require("./utils");

module.exports = {
  name: "got",

  /**
   * Got instance https://github.com/sindresorhus/got#instances
   *
   * @type {import("got").GotInstance} _client
   */
  _client: null,

  /**
   * Default settings
   */
  settings: {
    got: {
      includeMethods: null,
      // More about Got default options: https://github.com/sindresorhus/got#instances
      defaultOptions: {
        hooks: {
          beforeRequest: [
            options => {
              // Get Moleculer Logger instance
              const logger = options.logger;
              logger.info(logOutgoingRequest(options));
            }
          ],
          afterResponse: [
            (response, retryWithMergedOptions) => {
              // Get Moleculer Logger instance
              const logger = response.request.gotOptions.logger;
              logger.info(logIncomingResponse(response));

              return response;
            }
          ],
          beforeError: [
            error => {
              return error;
            }
          ]
        }
      }
    }
  },

  /**
   * Actions
   */
  actions: {
    test(ctx) {
      return "Hello " + (ctx.params.name || "Anonymous");
    }
  },

  /**
   * Methods
   */
  methods: {
    _get(url, opt) {
      if (opt && opt.stream) {
        return this._client.stream(url, opt);
      }

      return this._client.get(url, opt);
    },

    _post(url, payload, opt) {
      // if (opt && opt.stream) {
      return new Promise((resolve, reject) => {
        const writeStream = this._client.stream.post(url, opt);

        payload.pipe(writeStream);

        writeStream.on("response", res => resolve(res));

        writeStream.on("error", error => reject(error));
      });

      // return payload.pipe(this._client.stream.post(url));
      // }

      // return this._client.post(url, payload);
    },

    _put() {},

    _delete() {}
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    // Remove unwanted methods
    const { includeMethods } = this.settings.got;
    if (!includeMethods || Array.isArray(includeMethods)) {
      const methodsToRemove = _.difference(HTTP_METHODS, includeMethods);

      methodsToRemove.forEach(methodName => delete this[`_${methodName}`]);
    }

    // Extend Got client with default options
    const { defaultOptions } = this.settings.got;

    // Add Moleculer Logger to Got Params
    this.settings.got.defaultOptions.logger = this.logger;

    /**
     * @type {import("got").GotInstance}
     */
    this._client = got.extend(defaultOptions);
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {}
};
