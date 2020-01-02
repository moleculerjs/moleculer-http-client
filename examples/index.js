"use strict";

const moduleName = process.argv[2] || "actions-get";
process.argv.splice(2, 1);

require("./" + moduleName);
