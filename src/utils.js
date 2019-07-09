const chalk = require("chalk");

function coloringStatusCode(code) {
  if (code >= 500) return chalk.red.bold(code);
  if (code >= 400 && code < 500) return chalk.red.bold(code);
  if (code >= 300 && code < 400) return chalk.cyan.bold(code);
  if (code >= 200 && code < 300) return chalk.green.bold(code);
  return code;
}

function logOutgoingRequest(options) {
  return `=> HTTP Request to ${options.href}`;
}

function logIncomingResponse(response) {
  const method = response.request.gotOptions.method;

  return `<= HTTP ${method} to "${
    response.requestUrl
  }" returned with status code ${coloringStatusCode(response.statusCode)}`;
}

module.exports = {
  logOutgoingRequest,
  logIncomingResponse
};
