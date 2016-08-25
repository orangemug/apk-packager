var argv     = require("./argv");
var commands = require("./argv/commands");


if(argv._.length > 0) {
  commands[argv._[0]].handler(argv);
}
else {
  if(argv.version) {
    console.log(pkg.version);
    process.exit(0);
  }
}
