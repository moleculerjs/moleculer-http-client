/*
 * moleculer-http-client
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
 * MIT Licensed
 */
"use strict";
const { MoleculerError } = require("moleculer").Errors;

class MoleculerHTTPClientError extends MoleculerError {
  /**
   *
   * @param {string} msg
   * @param {any} data
   */
  constructor(msg, data) {
    super(msg, 500, "MOLECULER_HTTP_CLIENT_ERROR", data);
  }
}

/**
 * Function wrapping Got's errors with Moleculer errors
 *
 * @param {import("got").GeneralError} error
 * @returns {MoleculerHTTPClientError}
 */
function errorFormatter(error) {
  const { response } = error;

  // Not a HTTP Error
  /* istanbul ignore next */
  if (!response) {
    return new MoleculerHTTPClientError(`Moleculer HTTP Client Error.`, error);
  }

  // ToDo: Parse the Got Error.
  // Extract only what's needed
  // URL, status code and HTTP method is enough ?
  const parsedError = {
    message: error.message,
    method:
      response.req && response.req.method ? response.req.method : undefined,
    url: response.url,
    statusCode: response.statusCode,
    stack: error.stack
  };

  return new MoleculerHTTPClientError(
    `Moleculer HTTP Client Error.`,
    parsedError
  );
}

module.exports = { MoleculerHTTPClientError, errorFormatter };
