/*
 * moleculer-http-client
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */

"use strict";

/**
 * @typedef {import("got").GotInstance} GotInstance
 * @typedef {import("got").GotOptions} GotOptions
 * @typedef {import("got").GotBodyOptions} GotBodyOptions
 * @typedef {import("got").GotError} GotError
 * @typedef {import("moleculer").Context} Context
 */

const got = require("got");
const _ = require("lodash");
const stream = require("stream");

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

const {
  logOutgoingRequest,
  logIncomingResponse,
  loggerLevels
} = require("./logger-utils");
const { errorFormatter } = require("./errors");
const { formatter, formatOptions } = require("./response-formatter");

/**
 * Service mixin allowing Moleculer services to make HTTP requests
 *
 * @name moleculer-http-client
 * @module Service
 */
module.exports = {
  /**
   * @type {string} service name
   */
  name: "http",

  /**
   * Raw Got Client instance https://github.com/sindresorhus/got#instances
   *
   * @type {GotInstance} A reference to Got's client
   */
  _client: null,

  /**
   * Default settings
   */
  settings: {
    httpClient: {
      /**
       *  @type {Array<String>} Array with HTTP methods to include.
       *  If set to `null` no actions handlers will be created.
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
      responseFormatter: "raw",

      /**
       * @type {Function} Error handler
       */
      errorFormatter: errorFormatter,

      /**
       * @param {GotBodyOptions}
       *
       * More about Got default options: https://github.com/sindresorhus/got#instances
       */
      defaultOptions: {
        hooks: {
          /**
           * More info: https://github.com/sindresorhus/got#hooksbeforerequest
           */
          beforeRequest: [
            function outgoingLogger(options) {
              const { logger } = options;
              const { logOutgoingRequest } = options;

              if (logger && logOutgoingRequest) {
                logger.info(logOutgoingRequest(options));
              }
            }
          ],
          /**
           * More info: https://github.com/sindresorhus/got#hooksafterresponse
           */
          afterResponse: [
            function incomingLogger(response) {
              const { logger } = response.request.gotOptions;
              const { logIncomingResponse } = response.request.gotOptions;

              if (logger && logIncomingResponse) {
                logger[loggerLevels(response.statusCode)](
                  logIncomingResponse(response)
                );
              }

              return response;
            },
            function formatter(response) {
              const { responseFormatter } = response.request.gotOptions;

              return responseFormatter(response);
            }
          ],
          /**
           * More info: https://github.com/sindresorhus/got#hooksbeforeerror
           */
          beforeError: [
            /*error => {
              // Wait for a new (>v9.6.0) Got release
              // https://github.com/sindresorhus/got/issues/781
              // When released do error handling here instead of `_httpErrorHandler()` method
              return error;
            }*/
          ]
        }
      }
    }
  },

  actions: {
    get: {
      /**
       * HTTP GET Action
       * @param {Context} ctx
       */
      async handler(ctx) {
        try {
          return await this._get(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    },

    post: {
      /**
       * HTTP POST Action
       * @param {Context} ctx
       */
      async handler(ctx) {
        try {
          if (ctx.params instanceof stream.Readable) {
            return await this._post(ctx.meta.url, { stream: true }, ctx.params);
          }
          return await this._post(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    },

    put: {
      /**
       * HTTP PUT Action
       * @param {Context} ctx
       */
      async handler(ctx) {
        try {
          if (ctx.params instanceof stream.Readable) {
            return await this._put(ctx.meta.url, { stream: true }, ctx.params);
          }
          return await this._put(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    },

    patch: {
      /**
       * HTTP PATCH Action
       * @param {Context} ctx
       */
      async handler(ctx) {
        try {
          if (ctx.params instanceof stream.Readable) {
            return await this._patch(
              ctx.meta.url,
              { stream: true },
              ctx.params
            );
          }
          return await this._patch(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    },
    delete: {
      /**
       * HTTP DELETE Action
       * @param {Context} ctx
       */
      async handler(ctx) {
        try {
          return await this._delete(ctx.params.url, ctx.params.opt);
        } catch (error) {
          throw error;
        }
      }
    }
  },

  /**
   * Methods
   */
  methods: {
    /**
     * HTTP GET method
     * @param {string} url
     * @param {GotOptions} opt
     */
    _get(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "GET";
      return this._genericRequest(url, opt);
    },

    /**
     * HTTP POST method
     * @param {string} url
     * @param {GotOptions} opt
     * @param {stream.Readable} streamPayload
     */
    _post(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "POST";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP PUT method
     * @param {string} url
     * @param {GotOptions} opt
     * @param {stream.Readable} streamPayload
     */
    _put(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PUT";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP PUT method
     * @param {string} url
     * @param {GotOptions} opt
     * @param {stream.Readable} streamPayload
     */
    _patch(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PATCH";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP DELETE method
     * @param {string} url
     * @param {GotOptions} opt
     */
    _delete(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "DELETE";
      return this._genericRequest(url, opt);
    },

    /**
     * Request handler
     * @param {string} url
     * @param {GotOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise|stream.Readable}
     */
    _genericRequest(url, opt, streamPayload) {
      if (opt && opt.stream) {
        return this._streamRequest(url, opt, streamPayload);
      }

      return this._client(url, opt)
        .then(res => Promise.resolve(res))
        .catch(error => Promise.reject(this._httpErrorHandler(error)));
    },

    /**
     * Handles incoming and outgoing stream requests
     * @param {string} url
     * @param {GotOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise|stream.Readable}
     */
    _streamRequest(url, opt, streamPayload) {
      if (opt.method == "GET") {
        return this._client(url, opt).on("response", response => {
          // Got hooks don't work for Streams
          this.logger[loggerLevels(response.statusCode)](
            logIncomingResponse(response)
          );
        });
      }

      return new Promise((resolve, reject) => {
        const writeStream = this._client(url, opt);

        streamPayload.pipe(writeStream);

        writeStream.on("response", response => {
          // Got hooks don't work for Streams
          this.logger[loggerLevels(response.statusCode)](
            logIncomingResponse(response)
          );
          resolve(response);
        });

        writeStream.on("error", error => reject(this._httpErrorHandler(error)));
      });
    },

    /**
     * Error handling function that wraps Got's errors with Moleculer Errors
     * @param {GotError|Error} error
     * @returns {Error}
     */
    _httpErrorHandler(error) {
      const { errorFormatter } = this.settings.httpClient;

      if (_.isFunction(errorFormatter)) {
        return errorFormatter(error);
      }

      return error;
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    // Remove unwanted actions from the service
    let { includeMethods } = this.settings.httpClient;
    if (!includeMethods || Array.isArray(includeMethods)) {
      if (_.isNil(includeMethods)) includeMethods = [];

      const methodsToRemove = _.difference(
        HTTP_METHODS,
        includeMethods.map(name => name.toLowerCase())
      );

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
     * @type {GotInstance}
     */
    this._client = got.extend(defaultOptions);
  }
};
