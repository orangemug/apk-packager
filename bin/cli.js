var yargs = require("yargs");

var commands = require("./commands");
var pkg      = require("../package.json");


var argv = yargs
  .usage("Usage: $0 <command> [options]")
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


if(argv._.length > 0) {
  commands[argv._[0]].handler(argv);
}
else {
  if(argv.version) {
    console.log(pkg.version);
    process.exit(0);
  }
}
