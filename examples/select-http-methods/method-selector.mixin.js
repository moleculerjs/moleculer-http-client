"use strict";
const HTTPClientService = require("../../index");
const _ = require("lodash");

module.exports = methods => {
  _.difference(
    HTTPClientService.HTTP_METHODS, // Supported methods ["get", "post", "put", "patch", "delete"]
    methods.map(name => name.toLowerCase())
  ).forEach(method => {
    delete HTTPClientService.actions[method]; // Remove undesired methods from schema
  });

  return HTTPClientService;
};
