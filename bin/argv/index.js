var yargs = require("yargs");

var pkg      = require("../../package.json");
var commands = require("./commands");


module.exports = yargs
  .usage("Usage: $0 <command> [options] [root-dir]")
  .strict()
  .demand(1)
  .command(
    commands.build.command,
    commands.build.description,
    commands.build.parse
  )
  .command(
    commands.publish.command,
    commands.publish.description,
    commands.publish.parse
  )
  .command(
    commands.web.command,
    commands.web.description,
    commands.web.parse
  )
  .describe("version", "Return the version")
  .alias("version", "v")
  .help("help")
  .alias("help", "h")
  .epilogue("For more information <https://github.com/orangemug/apk-cd>")
  .argv;
