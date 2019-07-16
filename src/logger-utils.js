/*
 * moleculer-http-client
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */
"use strict";

const chalk = require("chalk");

/* istanbul ignore next */
function coloringStatusCode(code) {
  if (code >= 500) return chalk.red.bold(code);
  if (code >= 400 && code < 500) return chalk.red.bold(code);
  if (code >= 300 && code < 400) return chalk.cyan.bold(code);
  if (code >= 200 && code < 300) return chalk.green.bold(code);
  return code;
}
/* istanbul ignore next */
function loggerLevels(code) {
  if (code >= 500) return "error";
  if (code >= 400 && code < 500) return "warn";
  if (code >= 300 && code < 400) return "info";
  if (code >= 200 && code < 300) return "info";
  return code;
}

/**
 * Build a log message about outgoing request
 * This is a Got's BeforeRequest Hook Function. More info: `https://github.com/sindresorhus/got#hooksbeforerequest`
 *
 * @param {object} response Got Options object
 * @returns {string}
 */
function logOutgoingRequest(options) {
  return `=> HTTP ${options.method} to "${chalk.underline(options.href)}"`;
}

/**
 * Builds a log message about incoming request
 * This is a Got's afterResponse Hook Function. More info: `https://github.com/sindresorhus/got#hooksafterresponse`
 *
 * @param {object} response Got Request option.
 * @returns {string}
 */
function logIncomingResponse(response) {
  const method = response.request.gotOptions.method;

  if (response.fromCache) {
    return `**CACHED** HTTP ${method} to "${chalk.underline(
      response.requestUrl
    )}" returned with status code ${coloringStatusCode(response.statusCode)}`;
  }
  return `<= HTTP ${method} to "${chalk.underline(
    response.requestUrl
  )}" returned with status code ${coloringStatusCode(response.statusCode)}`;
}

module.exports = {
  logOutgoingRequest,
  logIncomingResponse,
  loggerLevels
};
