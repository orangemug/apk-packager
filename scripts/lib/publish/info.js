var cp       = require("child-process-promise");
var fs       = require("fs-promise");
var Bluebird = require("bluebird");
var github   = require("./github");


function queryFilesystem(cwd) {
  return fs.readdir(cwd+"/repository/x86_64");
}

function queryGit() {
  var remote = cp
    .exec("git ls-remote --get-url origin")
    .then(function(data) {
      var matches = data.stdout
        .toString()
        .replace(/^\s*|\s*$/gm, "")
        .match(/(?:git:|git@|https:\/\/)(github.com)[:/]([^/]+)\/([^/]+).git/)

      return {
        host: matches[1],
        user: matches[2],
        repo: matches[3]
      }
    });

  return Bluebird.props({
    branch: cp
    .exec("git rev-parse --abbrev-ref HEAD")
    .then(function(rslt) {
      return rslt.stdout
        .toString()
        .replace(/^\s*|\s*$/gm, "");
    }),
    host: remote
    .then(function(data) {
      return data.host;
    }),
    user: remote
    .then(function(data) {
      return data.user;
    }),
    repo: remote
    .then(function(data) {
      return data.repo;
    })
  });
}

function queryAssets(gitData) {
  return github
    .repos.getReleaseByTag({
      user: gitData.user,
      repo: gitData.repo,
      tag: gitData.branch+"/x86_64"
    })
    .then(function(release) {
      return github
        .repos.listAssets({
          user: gitData.user,
          repo: gitData.repo,
          id: release.id
        })
    })
    .then(function(ret) {
      var assets = {};
      ret.forEach(function(item) {
        assets[item.name] = item;
      });
      return assets;
    })
    .catch(function() {
      return {};
    });
}

/**
 * Get all the required info
 */
module.exports = function(cwd) {
  return Bluebird
    .props({
      files: queryFilesystem(cwd),
      git:   queryGit()
    })
    .then(function(data) {
      return Bluebird.props({
        assets: queryAssets(data.git),
        files:  data.files,
        git:    data.git
      });
    });
}
