const argv = require("yargs").argv;

require("babel-polyfill");
require("app-module-path").addPath(__dirname);
require("babel-core/register")({
  ignore: /node_modules\//
});

if (argv.file) require(argv.file);
