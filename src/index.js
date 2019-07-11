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

      logging: true,
      logOutgoingRequest: logOutgoingRequest,
      logIncomingResponse: logIncomingResponse,

      responseFormater: "something",

      // More about Got default options: https://github.com/sindresorhus/got#instances
      defaultOptions: {
        hooks: {
          beforeRequest: [
            function outgoingLogger(options) {
              const { logger } = options;
              const { logOutgoingRequest } = options;
              if (logger && logOutgoingRequest) {
                logOutgoingRequest(logger, options);
              }
            }
          ],
          afterResponse: [
            function incomingLogger(response, retryWithMergedOptions) {
              const { logger } = response.request.gotOptions;
              const { logIncomingResponse } = response.request.gotOptions;
              if (logger && logIncomingResponse) {
                logIncomingResponse(logger, response);
              }

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
  /*
  actions: {
    test(ctx) {
      return "Hello " + (ctx.params.name || "Anonymous");
    }
  },
  */

  /**
   * Methods
   */
  methods: {
    _get(url, opt) {
      opt.method = "GET";
      return this._genericRequest(url, opt);
    },

    _post(url, opt, streamPayload) {
      opt.method = "POST";
      return this._genericRequest(url, opt, streamPayload);
    },

    _put(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PUT";
      return this._genericRequest(url, opt);
    },

    _patch(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PATCH";
      return this._genericRequest(url, opt, streamPayload);
    },

    _delete(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "DELETE";
      return this._genericRequest(url, opt);
    },

    _genericRequest(url, opt, streamPayload) {
      if (opt && opt.stream) {
        return this._streamRequest(url, opt, streamPayload);
      }

      return this._client(url, opt);
    },

    _streamRequest(url, opt, streamPayload) {
      if (opt.method == "GET") {
        return this._client(url, opt).on("response", res => {
          // Got hooks don't work for Streams
          logIncomingResponse(this.logger, res);
        });
      }

      return new Promise((resolve, reject) => {
        const writeStream = this._client(url, opt);

        streamPayload.pipe(writeStream);

        writeStream.on("response", res => {
          // Got hooks don't work for Streams
          logIncomingResponse(this.logger, res);
          resolve(res);
        });

        writeStream.on("error", error => reject(error));
      });
    }
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

    // Add Logging functions got Got's default options
    let defaultOptions = this.settings.got.defaultOptions;

    if (this.settings.got.logging) {
      defaultOptions.logger = this.logger;
      defaultOptions.logIncomingResponse = this.settings.got.logIncomingResponse;
      defaultOptions.logOutgoingRequest = this.settings.got.logOutgoingRequest;
    }

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
