/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */
"use strict";
const { MoleculerError } = require("moleculer").Errors;

class MoleculerHTTPClientError extends MoleculerError {
  constructor(msg, data) {
    super(
      msg || `HTTP Client Error.`,
      500,
      "MOLECULER_HTTP_CLIENT_ERROR",
      data
    );
  }
}

function errorFormatter(error) {
  return error;
}

module.exports = { MoleculerHTTPClientError, errorFormatter };
