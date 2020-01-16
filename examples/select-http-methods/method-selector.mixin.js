"use strict";
const HTTPClientService = require("../../index");
const _ = require("lodash");

module.exports = methods => {
  // Remove undesired methods from schema
  _.difference(
    HTTPClientService.HTTP_METHODS, // Supported methods ["get", "post", "put", "patch", "delete"]
    methods.map(name => name.toLowerCase())
  ).forEach(method => {
    delete HTTPClientService.actions[method];
  });

  return HTTPClientService;
};
