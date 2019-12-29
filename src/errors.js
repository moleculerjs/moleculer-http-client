/*
 * moleculer-http-client
 * Copyright (c) 2019 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
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
 * @param {import("got").GeneralError} error
 * @returns {MoleculerHTTPClientError}
 */
function errorFormatter(error) {
  // ToDo: Parse the Got Error. Extract only what's needed
  const parsedError = {
    method:
      error.response.req && error.response.req.method
        ? error.response.req.method
        : null,
    statusCode: error.response.statusCode,
    stack: error.stack,
    message: error.message
  };
  return new MoleculerHTTPClientError(
    `Moleculer HTTP Client Error.`,
    parsedError
  );
}

module.exports = { MoleculerHTTPClientError, errorFormatter };
