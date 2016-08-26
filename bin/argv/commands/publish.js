var cp        = require("child_process");
var fsp       = require("fs-promise");
var GitHubApi = require("github");
var path      = require("path");


module.exports = {
  command: "publish",
  description: "Publish packages to github",
  parse: function(yargs) {
    return yargs
      .reset()
      .usage("Usage: $0 "+module.exports.command+" [root-dir]")
      .argv;
  },
  handler: function(argv) {
    var AUTH_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

    var untracked = [];
    var dirty     = [];

    var CHECK_DIRTY = false;

    if(CHECK_DIRTY) {
      cp
        .execSync("git status --untracked-files --porcelain")
        .toString()
        .replace(/^\s*|\s*$/g, "")
        .split("\n")
        .forEach(function(str) {
          var matches = str.match(/^\s*(.+)\s+(.*)$/);
          if(matches[1] === "??") {
            untracked.push(matches[2]);
          }
          else {
            dirty.push(matches[2]);
          }
        });

      function pad(num, prefix) {
        prefix = prefix || "";
        return function(item) {
          var str = "";
          for(var i=0; i<num; i++) {
            str+=" ";
          }
          return str+prefix+item;
        }
      }

      if(untracked.length > 0 || dirty.length > 0) {
        if(untracked.length > 0) {
          console.log("untracked:\n"+untracked.map(pad(2, "- ")).join("\n"));
        }
        else if(dirty.length > 0) {
          console.log("dirty:\n"+dirty.map(pad(2, "- ")).join("\n"));
        }
        process.exit(1);
      }
    }

    var github = new GitHubApi({
      debug: true,
      protocol: "https",
      host: "api.github.com", // should be api.github.com for GitHub
      Promise: Promise,
      timeout: 10*1000
    });

    github.authenticate({
      type: "oauth",
      token: AUTH_TOKEN
    });

    var branch = cp
      .execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .replace(/^\s*|\s*$/gm, "");

    var remoteMatches = cp
      .execSync("git ls-remote --get-url origin")
      .toString()
      .replace(/^\s*|\s*$/gm, "")
      .match(/(?:git:|git@|https:\/\/)(github.com)[:/]([^/]+)\/([^/]+).git/)

    var gitHost = remoteMatches[1];
    var gitUser = remoteMatches[2];
    var gitRepo = remoteMatches[3];

    if(gitHost !== "github.com") {
      console.log("Invalid gitHost: %s", gitHost);
      process.exit(1);
    }

    github
      .repos.getReleaseByTag({
        user: gitUser,
        repo: gitRepo,
        tag: branch+"/x86_64"
      })
      .catch(function(err) {
        if(err.code === 404) {
          return github
            .repos.createRelease({
              user: gitUser,
              repo: gitRepo,
              // Link to the current 'branch'
              target_commitish: branch,
              tag_name: branch+"/x86_64"
            })
        }
        else {
          throw err;
        }
      })
      .then(function(release) {
        var basepath = path.join(__dirname, "repository/x86_64");

        return fsp
          .readdir(__dirname+"/repository/x86_64")
          .then(function(data) {
            return github.repos.listAssets({
              user: gitUser,
              repo: gitRepo,
              id: release.id
            })
            .then(function(ret) {
              var assets = {};
              ret.forEach(function(item) {
                assets[item.name] = item;
              });
              return {
                files: data,
                assetCache: assets
              };
            })
          })
          .then(function(data) {
            var promises = data.files.map(function(name) {
              var filepath = path.join(basepath, name);

              function deleteAsset(id) {
                console.log("deleteAsset", filepath, id);
                return github
                  .repos.deleteAsset({
                    user: gitUser,
                    repo: gitRepo,
                    id: id,
                  })
              }

              function uploadAsset() {
                console.log("uploadAsset", filepath);
                try {
                return github
                  .repos.uploadAsset({
                    user: gitUser,
                    repo: gitRepo,
                    id: release.id,
                    filePath: filepath,
                    name: "TEMP-"+path.basename(filepath)
                  })
                  .catch(function(err) {
                    console.log("uploadAsset err", err)
                  });
                } catch(err) {
                  console.error("err> ", err)
                }
              }

              function switchAsset(obj, oldId) {
                var name = obj.name;
                var newName = obj.name.replace(/^TEMP-/, "");
                console.log("switchAsset %s: %s -> %s", filepath, name, newName); 

                var p;
                if(oldId) {
                  p = deleteAsset(oldId);
                }
                else {
                  p = Promise.resolve();
                }

                return p
                  .then(function() {
                    console.log("renaming...", name, newName);
                    return github
                      .repos.editAsset({
                        user: gitUser,
                        repo: gitRepo,
                        id: obj.id,
                        name: newName,
                        label: newName
                      })
                  });
              }

              var cachedAsset = data.assetCache[name];
              var cachedTempAsset = data.assetCache["TEMP-"+name];
              return uploadAsset()
                .then(function(ret) {
                  var id = (cachedAsset ? cachedAsset.id : null);
                  if(cachedTempAsset) {
                    console.log(">>>>>>>>", cachedTempAsset);
                    return deleteAsset(cachedTempAsset.id)
                      .then(function() {
                        return switchAsset(ret, id)
                      });
                  }
                  else {
                    return switchAsset(ret, id)
                  }
                })
            });

            return Promise.all(promises);
          });
      })
      .catch(function(err) {
        console.log("err", JSON.stringify(err, null, 2));
      })
  }
};

