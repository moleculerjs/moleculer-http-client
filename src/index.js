/*
 * moleculer-http-client
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */

"use strict";

const got = require("got");
const _ = require("lodash");
const stream = require("stream");

const HTTP_METHODS = ["get", "put", "post", "delete"];

const {
  logOutgoingRequest,
  logIncomingResponse,
  loggerLevels
} = require("./logger-utils");
const { errorFormatter } = require("./errors");
const { formatter, formatOptions } = require("./response-formatter");

module.exports = {
  /**
   * @type {string} service name
   */
  name: "http",

  /**
   * Raw Got Client instance https://github.com/sindresorhus/got#instances
   *
   * @type {import("got").GotInstance} _client
   */
  _client: null,

  /**
   * Default settings
   */
  settings: {
    httpClient: {
      /**
       *  @type {Array<String>} Array with HTTP methods to include
       */
      includeMethods: null,

      /**
       *  @type {Boolean} Whether to log or not the requests
       */
      logging: true,

      /**
       * @type {Function} Logger function with outgoing info
       */
      logOutgoingRequest: logOutgoingRequest,

      /**
       *  @type {Function} Logger function with incoming info
       */
      logIncomingResponse: logIncomingResponse,

      /**
       * @type {string | Function} Function to formatting the HTTP response
       */
      responseFormatter: null,

      /**
       * @type {Function} Error handler
       */
      errorFormatter: errorFormatter,

      // More about Got default options: https://github.com/sindresorhus/got#instances
      defaultOptions: {
        hooks: {
          beforeRequest: [
            function outgoingLogger(options) {
              const { logger } = options;
              const { logOutgoingRequest } = options;
              if (logger && logOutgoingRequest) {
                logger.info(logOutgoingRequest(options));
              }
            }
          ],
          afterResponse: [
            function incomingLogger(response, retryWithMergedOptions) {
              const { logger } = response.request.gotOptions;
              const { logIncomingResponse } = response.request.gotOptions;
              if (logger && logIncomingResponse) {
                logger[loggerLevels(response.statusCode)](
                  logIncomingResponse(response)
                );
              }

              // console.log(response);

              return response;
            },
            function formatter(response, retryWithMergedOptions) {
              const { responseFormatter } = response.request.gotOptions;
              const { json } = response.request.gotOptions;

              return responseFormatter(response, json);
              // return response;
            }
          ],
          beforeError: [
            /*error => {
              // Wait for a new (>v9.6.0) Got release
              // https://github.com/sindresorhus/got/issues/781
              return error;
            }*/
          ]
        }
      }
    }
  },

  actions: {
    async get(ctx) {
      try {
        return await this._get(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw this._httpErrorHandler(error);
      }
    },

    async post(ctx) {
      try {
        if (ctx.params instanceof stream.Readable) {
          return await this._post(ctx.meta.url, { stream: true }, ctx.params);
        }
        return await this._post(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw this._httpErrorHandler(error);
      }
    },

    async put(ctx) {
      try {
        if (ctx.params instanceof stream.Readable) {
          return await this._put(ctx.meta.url, { stream: true }, ctx.params);
        }
        return await this._put(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw this._httpErrorHandler(error);
      }
    },

    async patch(ctx) {
      try {
        if (ctx.params instanceof stream.Readable) {
          return await this._patch(ctx.meta.url, { stream: true }, ctx.params);
        }
        return await this._patch(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw await this._httpErrorHandler(error);
      }
    },

    async delete(ctx) {
      try {
        return await this._delete(ctx.params.url, ctx.params.opt);
      } catch (error) {
        throw await this._httpErrorHandler(error);
      }
    }
  },

  /**
   * Methods
   */
  methods: {
    _get(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "GET";
      return this._genericRequest(url, opt);
    },

    _post(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "POST";
      return this._genericRequest(url, opt, streamPayload);
    },

    _put(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PUT";
      return this._genericRequest(url, opt, streamPayload);
    },

    _patch(url, opt, streamPayload) {
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
          logIncomingResponse(res);
        });
      }

      return new Promise((resolve, reject) => {
        const writeStream = this._client(url, opt);

        streamPayload.pipe(writeStream);

        writeStream.on("response", res => {
          // Got hooks don't work for Streams
          logIncomingResponse(res);
          resolve(res);
        });

        writeStream.on("error", error => reject(error));
      });
    },

    _httpErrorHandler(error) {
      if (!this.settings.httpClient.errorFormatter) {
        return error;
      }

      return errorFormatter(error);
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    // Remove unwanted actions from the service
    const { includeMethods } = this.settings.httpClient;
    if (!includeMethods || Array.isArray(includeMethods)) {
      const methodsToRemove = _.difference(HTTP_METHODS, includeMethods);

      methodsToRemove.forEach(methodName => {
        delete this.actions[`${methodName}`];
      });
    }

    // Add Logging functions got Got's default options
    const { defaultOptions } = this.settings.httpClient;

    if (this.settings.httpClient.logging) {
      defaultOptions.logger = this.logger;
      defaultOptions.logIncomingResponse = this.settings.httpClient.logIncomingResponse;
      defaultOptions.logOutgoingRequest = this.settings.httpClient.logOutgoingRequest;
    }

    // Set Response formatting function
    const { responseFormatter } = this.settings.httpClient;
    if (
      _.isString(responseFormatter) &&
      formatOptions.includes(responseFormatter)
    ) {
      defaultOptions.responseFormatter = formatter[responseFormatter];
    } else {
      defaultOptions.responseFormatter = formatter["raw"];
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
