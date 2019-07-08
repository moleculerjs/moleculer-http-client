const { MoleculerError } = require("moleculer").Errors;

class MoleculerGotError extends MoleculerError {
  constructor(msg, data) {
    super(msg || `Got Client HTTP Error.`, 500, "MOLECULER_HTTP_ERROR", data);
  }
}

module.exports = { MoleculerGotError };
