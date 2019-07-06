/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-got)
 * MIT Licensed
 */

"use strict";

const got = require("got");
const _ = require("lodash");

const HTTP_METHODS = ["get", "put", "post", "delete"];

const { MoleculerError } = require("moleculer").Errors;

class MoleculerGotError extends MoleculerError {
  constructor(msg, data) {
    super(msg || `Got Client HTTP Error.`, 500, "MOLECULER_HTTP_ERROR", data);
  }
}

module.exports = {
  name: "got",

  /**
   * Got instance https://github.com/sindresorhus/got#instances
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
          afterResponse: [],
          beforeError: []
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
    _get(url, opt, stream = false) {
      if (stream) return this._client.stream(url, opt);

      return this._client.get(url, opt);
    },

    _post() {},

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
