/*
 * moleculer-http-client
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-http-client)
 * MIT Licensed
 */
"use strict";

/**
 * @typedef {import("got").Response} Response
 */

const formatter = {
  /** @param {Response} response */
  body: response => response.body,
  /** @param {Response} response */
  headers: response => response.headers,
  /** @param {Response} response */
  status: response => response.statusCode,
  /** @param {Response} response */
  raw: response => response
};

const formatOptions = Object.keys(formatter);

module.exports = { formatter, formatOptions };
