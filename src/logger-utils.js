/*
 * moleculer-http-client
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
 * MIT Licensed
 */
"use strict";

const kleur = require("kleur");

/* istanbul ignore next */
/** @param {number} code */
function coloringStatusCode(code) {
  if (code >= 500) return kleur.red().bold(code);
  if (code >= 400 && code < 500) return kleur.red().bold(code);
  if (code >= 300 && code < 400) return kleur.cyan().bold(code);
  if (code >= 200 && code < 300) return kleur.green().bold(code);
  return code;
}
/* istanbul ignore next */
/** @param {number} code */
function loggerLevels(code) {
  if (code >= 500) return "error";
  if (code >= 400 && code < 500) return "warn";
  if (code >= 300 && code < 400) return "info";
  if (code >= 200 && code < 300) return "info";
  return "warn";
}

/**
 * Build a log message about outgoing request
 * This is a Got's BeforeRequest Hook Function. More info: `https://github.com/sindresorhus/got#hooksbeforerequest`
 *
 * @param {import("got").NormalizedOptions} options Got Options object
 * @returns {string}
 */
function logOutgoingRequest(options) {
  return `=> HTTP ${options.method} to "${kleur.underline(options.url.href)}"`;
}

/**
 * Builds a log message about incoming request
 * This is a Got's afterResponse Hook Function. More info: `https://github.com/sindresorhus/got#hooksafterresponse`
 *
 * @param {import("got").Response} response Got Request option.
 * @returns {string}
 */
function logIncomingResponse(response) {
  const method = response.request.options.method;

  if (response.isFromCache) {
    /* istanbul ignore next */
    return `${kleur.bgCyan(
      `*From Cache*`
    )} HTTP ${method} to "${kleur.underline(
      response.requestUrl
    )}" returned with status code ${coloringStatusCode(response.statusCode)}`;
  }
  return `<= HTTP ${method} to "${kleur.underline(
    response.requestUrl
  )}" returned with status code ${coloringStatusCode(response.statusCode)}`;
}

module.exports = {
  logOutgoingRequest,
  logIncomingResponse,
  loggerLevels
};
