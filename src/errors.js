/*
 * moleculer-http-client
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */
"use strict";
const { MoleculerError } = require("moleculer").Errors;

class MoleculerHTTPClientError extends MoleculerError {
  constructor(msg, data) {
    super(msg, 500, "MOLECULER_HTTP_CLIENT_ERROR", data);
  }
}

/**
 * Function wrapping Got's errors with Moleculer errors
 *
 * @param {import("got").GotError | Error} error
 * @returns {MoleculerHTTPClientError}
 */
function errorFormatter(error) {
  // ToDo: Parse the Got Error. Extract only what's needed
  return new MoleculerHTTPClientError(`Moleculer HTTP Client Error.`, error);
}

module.exports = { MoleculerHTTPClientError, errorFormatter };
