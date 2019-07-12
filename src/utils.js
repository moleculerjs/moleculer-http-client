/*
 * moleculer-got
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */
"use strict";

const chalk = require("chalk");

function coloringStatusCode(code) {
  if (code >= 500) return chalk.red.bold(code);
  if (code >= 400 && code < 500) return chalk.red.bold(code);
  if (code >= 300 && code < 400) return chalk.cyan.bold(code);
  if (code >= 200 && code < 300) return chalk.green.bold(code);
  return code;
}

function loggerLevels(code) {
  if (code >= 500) return "error";
  if (code >= 400 && code < 500) return "warn";
  if (code >= 300 && code < 400) return "info";
  if (code >= 200 && code < 300) return "info";
  return code;
}

function logOutgoingRequest(logger, options) {
  logger.info(`=> HTTP ${options.method} to ${options.href}`);
}

function logIncomingResponse(logger, response) {
  const method = response.request.gotOptions.method;

  const message = `<= HTTP ${method} to "${
    response.requestUrl
  }" returned with status code ${coloringStatusCode(response.statusCode)}`;

  logger[loggerLevels(response.statusCode)](message);
}

module.exports = {
  logOutgoingRequest,
  logIncomingResponse
};
