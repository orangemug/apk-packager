#!/usr/bin/env node
/**
 * Boots a docker container
 */
var path      = require("path");
var Dockerode = require("dockerode")

var pkg  = require("../package.json");
var argv = require("./argv");


var docker = new Dockerode();

var rootdir;
if(argv._[1]) {
  rootdir = path.resolve(process.cwd(), argv._[1])
}
else {
  rootdir = process.cwd()
}

console.log(rootdir)

var args = ["node", "./bin/cli.js"].concat(
  process.argv.slice(2)
);

// var args = ["ls", "-l", "/home/tmpbuild/node_modules"]

docker
  .run("orangemug/apk-packager"/*+pkg.version*/, args, [process.stdout, process.stderr], {
    "Tty": false,
    "user": "tmpbuild",
    "Binds": [
      rootdir+"/apk:/home/tmpbuild/apk",
      rootdir+"/repository:/home/tmpbuild/repository",
      rootdir+"/packages:/home/tmpbuild/packages"
    ]
  }, function(err, data, container) {
    if(err) {
      console.log("Error: %s", err);
      process.exit(1);
    }
    else {
      process.exit(0);
    }
  })
