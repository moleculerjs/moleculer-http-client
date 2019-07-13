/*
 * moleculer-http-client
 * Copyright (c) 2019 André Mazayev (https://github.com/AndreMaz/moleculer-http-client)
 * MIT Licensed
 */
"use strict";

const formatter = {
  body: (req, json) => {
    if (json === true) {
      try {
        return JSON.parse(req.body);
        // return req.body;
      } catch (error) {
        throw error;
      }
    }
    return req.body;
  },
  headers: req => {
    return req.headers;
  },
  status: req => req.statusCode,
  raw: req => req
};

const formatOptions = Object.keys(formatter);

module.exports = { formatter, formatOptions };
