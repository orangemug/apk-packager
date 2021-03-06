var Bluebird = require("bluebird");
var glob     = require("glob-promise");
var path     = require("path");
var semver   = require("semver");
var cp       = require("child-process-promise");


module.exports = {
  command: "build",
  description: "Build packages in ./apk",
  parse: function(yargs) {
    return yargs
      .reset()
      .usage(
        "Build an APK from the directory './apk/{pkg_name}/{version}'\n\n\Passing no options will build all packages\n\n" +
        "Usage: $0 "+module.exports.command+" [root-dir]"
      )
      .option("verbose", {
        alias: "v",
        describe: "Verbose logging",
        type: "boolean"
      })
      .option("dry-run", {
        describe: "Dry run but don't actually do anything",
        type: "boolean"
      })
      .option("filter", {
        alias: "f",
        describe: "Filter packages in the format 'pkg-name[semver]'",
        type: "string"
      })
  },
  handler: function(argv) {
    var commands = [
      "sudo apk update",
      "abuild-keygen -a"
    ];

    var filterName;
    var filterVersion;
    if(argv.filter) {
      var filterMatches = argv.filter.match(/^([^~^@]+)([~^@].*)?/)
      filterName    = filterMatches[1];
      filterVersion = (filterMatches[2] || "")
        .replace(/^@/, "");
    }

    var baseDir = process.cwd();
    var globStr = baseDir+"/apk/*/*";

    return  glob(globStr)
      .then(function(results) {
        var files = results
          .filter(function(result) {
            var basePath = path.relative(baseDir, result)
            var parts = basePath.split(path.sep);

            var okName    = true;
            var okVersion = true;

            if(filterName) {
              okName = (parts[1] === filterName);
            }
            if(filterVersion) {
              var version = parts[2];
              okVersion = semver.satisfies(version, filterVersion)
            }

            return (
                 okName
              && okVersion
            );
          })
          .map(function(filepath) {
            return Promise.resolve()
              .then(function() {
                return cp
                  .exec("source ./APKBUILD; echo $pkgname $subpackages", {
                    cwd: filepath
                  })
                  .then(function(data) {
                    var parts = data.stdout.replace(/^\s|\s$/g, "").split(/\s+/);
                    return {
                      filepath: filepath,
                      package: parts[0],
                      subpackages: parts.slice(1)
                    };
                  })
              })
              .then(function(result) {
                return cp
                  .exec("source ./APKBUILD; echo $pkgrel", {
                    cwd: filepath
                  })
                  .then(function(data) {
                    return Object.assign(result, {
                      pkgrel: data.stdout.replace(/^\s|\s$/g, "")
                    });
                  })
              })
              .then(function(result) {
                return cp
                  .exec("source ./APKBUILD; echo $pkgver", {
                    cwd: filepath
                  })
                  .then(function(data) {
                    return Object.assign(result, {
                      pkgver: data.stdout.replace(/^\s|\s$/g, "")
                    });
                  })
              })
          })

        return Promise.all(files)
          .then(function(results) {
            results 
              .forEach(function(obj) {
                commands.push("cd "+obj.filepath+"; abuild checksum");
                commands.push("mkdir -p /home/tmpbuild/build-cache")
                commands.push("cd "+obj.filepath+"; abuild sanitycheck");
                commands.push("cd "+obj.filepath+"; abuild deps");
                commands.push("cd "+obj.filepath+"; abuild clean");
                commands.push("cd "+obj.filepath+"; abuild fetch");
                commands.push("cd "+obj.filepath+"; abuild unpack");
                commands.push("cd "+obj.filepath+"; abuild prepare");
                commands.push("cd "+obj.filepath+"; abuild build");
                commands.push("cd "+obj.filepath+"; abuild rootpkg");
                commands.push("cd "+obj.filepath+"; abuild cleanup");
                // -r -K -s /home/tmpbuild/build-cache/");
              });

            commands.push("mkdir -p /home/tmpbuild/repository/x86_64")

            var repopath  = "./repository/x86_64/";
            var repoIndex = repopath+"APKINDEX.tar.gz";

            results.forEach(function(def) {
              def.subpackages.forEach(function(subpkgname) {
                var apkname   = subpkgname+"-"+def.pkgver+"-r"+def.pkgrel+".apk";
                var sympath   = repopath+apkname;
                var apkpath   = "./packages/"+def.package+"/x86_64/"+apkname;

                commands.push("rm "+sympath+" || true");
                commands.push("ln -s "+path.relative(path.dirname(sympath), apkpath)+" "+sympath);
              });
            });

            commands.push("apk index -o "+repoIndex+" "+repopath+"/*.apk");

            return commands;
          })
      })
      .then(function(commands) {
        if(argv.dryRun) {
          var prefix = "\n  - ";
          console.log("Dry run:\n"+prefix+commands.join(prefix))
        }
        else {
          return Bluebird.resolve(commands)
            .mapSeries(function(command) {
              if(argv.verbose) {
                console.log("run: %s", command);
              }
              return cp.spawn("sh", ["-c", command], {
                stdio: "inherit"
              })
            })
        }
      })
      .catch(function(err) {
        console.log("Err: %s", err);
        process.exit(1);
      })
  }
};
