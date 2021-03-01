/*
 * moleculer-http-client
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
 * MIT Licensed
 */

"use strict";

/**
 * @typedef {import("got").Got} GotInstance
 * @typedef {import("got").Options} GotRequestOptions
 * @typedef {import("got").RequestError} RequestError
 * @typedef {import('got').BeforeRequestHook} GotBeforeRequestHook
 * @typedef {import('got').AfterResponseHook} GotAfterResponseHook
 * @typedef {import('got').BeforeErrorHook} GotBeforeErrorHook
 * @typedef {import('got').Response} GotResponse
 * @typedef {import('got').NormalizedOptions} GotNormalizedOptions
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
    // Fix for: https://github.com/moleculerjs/moleculer-http-client/issues/5
    // JSON.stringify of logger reference caused: "Converting circular structure to JSON" Error
    $secureSettings: [
			"httpClient.defaultOptions.logger"
		],

    httpClient: {
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
       * @type {GotBodyOptions}
       *
       * More about Got default options: https://github.com/sindresorhus/got#instances
       */
      defaultOptions: {
        hooks: {
          /**
           * More info: https://github.com/sindresorhus/got#hooksbeforerequest
           * @type {GotBeforeRequestHook}
           */
          beforeRequest: [
            /**@param {GotNormalizedOptions} options */
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
           * @type {GotAfterResponseHook}
           */
          afterResponse: [
            /**@param {GotResponse} response */
            function incomingLogger(response) {
              const { logger } = response.request.options;
              const { logIncomingResponse } = response.request.options;

              if (logger && logIncomingResponse) {
                logger[loggerLevels(response.statusCode)](
                  logIncomingResponse(response)
                );
              }

              return response;
            }
          ],
          /**
           * More info: https://github.com/sindresorhus/got#hooksbeforeerror
           * @type {GotBeforeErrorHook}
           */
          beforeError: []
        }
      }
    }
  },

  actions: {
    get: {
      /**
       * HTTP GET Action
       * @param {Context} ctx
       * @returns {Promise|stream.Readable}
       */
      async handler(ctx) {
        return this._get(ctx.params.url, ctx.params.opt);
      }
    },

    post: {
      /**
       * HTTP POST Action
       * @param {Context} ctx
       * @returns {Promise}
       */
      async handler(ctx) {
        if (ctx.params instanceof stream.Readable) {
          ctx.meta.isStream = true; // Default value when streaming
          return this._post(ctx.meta.url, ctx.meta, ctx.params);
        }
        return this._post(ctx.params.url, ctx.params.opt);
      }
    },

    put: {
      /**
       * HTTP PUT Action
       * @param {Context} ctx
       * @returns {Promise}
       */
      async handler(ctx) {
        if (ctx.params instanceof stream.Readable) {
          ctx.meta.isStream = true; // Default value when streaming
          return this._put(ctx.meta.url, ctx.meta, ctx.params);
        }
        return this._put(ctx.params.url, ctx.params.opt);
      }
    },

    patch: {
      /**
       * HTTP PATCH Action
       * @param {Context} ctx
       * @returns {Promise}
       */
      async handler(ctx) {
        if (ctx.params instanceof stream.Readable) {
          ctx.meta.isStream = true; // Default value when streaming
          return this._patch(ctx.meta.url, ctx.meta, ctx.params);
        }
        return this._patch(ctx.params.url, ctx.params.opt);
      }
    },
    delete: {
      /**
       * HTTP DELETE Action
       * @param {Context} ctx
       * @returns {Promise}
       */
      async handler(ctx) {
        return this._delete(ctx.params.url, ctx.params.opt);
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
     * @param {GotRequestOptions} opt
     * @returns {Promise|stream.Readable}
     */
    _get(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "GET";
      return this._genericRequest(url, opt);
    },

    /**
     * HTTP POST method
     * @param {string} url
     * @param {GotRequestOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise}
     */
    _post(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "POST";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP PUT method
     * @param {string} url
     * @param {GotRequestOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise}
     */
    _put(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PUT";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP PUT method
     * @param {string} url
     * @param {GotRequestOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise}
     */
    _patch(url, opt, streamPayload) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "PATCH";
      return this._genericRequest(url, opt, streamPayload);
    },

    /**
     * HTTP DELETE method
     * @param {string} url
     * @param {GotRequestOptions} opt
     * @returns {Promise}
     */
    _delete(url, opt) {
      if (!_.isObject(opt)) opt = {};

      opt.method = "DELETE";
      return this._genericRequest(url, opt);
    },

    /**
     * Request handler
     * @param {string} url
     * @param {GotRequestOptions} opt
     * @param {stream.Readable} streamPayload
     * @returns {Promise|stream.Readable}
     */
    _genericRequest(url, opt, streamPayload) {
      if (opt && opt.isStream) {
        return this._streamRequest(url, opt, streamPayload);
      }

      return this._client(url, opt)
        .then(res => {
          let { responseFormatter } = this.settings.httpClient.defaultOptions;
          return Promise.resolve(responseFormatter(res));
        })
        .catch(error => Promise.reject(this._httpErrorHandler(error)));
    },

    /**
     * Handles incoming and outgoing stream requests
     * @param {string} url
     * @param {GotRequestOptions} opt
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
        const writeStream = this._client(opt);

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
     * @param {RequestError} error
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
    // Add Logging functions Got's default options
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
  },

  HTTP_METHODS
};
