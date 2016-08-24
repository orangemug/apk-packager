function deleteAsset(git, id) {
  return github
    .repos.deleteAsset({
      user: git.user,
      repo: git.repo,
      id: id
    })
}

function uploadAsset(git, id, filepath) {
  return github
    .repos.uploadAsset({
      user: git.user,
      repo: git.repo,
      id:   id,
      filePath: filepath,
      name: "TEMP-"+path.basename(filepath)
    });
}


function switchAsset(asset, oldId) {
  var name = asset.name;
  var newName = asset.name.replace(/^TEMP-/, "");
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
          id: asset.id,
          name: newName,
          label: newName
        })
    });
}


module.exports = function(data) {
  var promises = data.files.map(function(name) {
    var filepath = path.join(basepath, name);

    var cachedAsset     = data.assetCache[name];
    var cachedTempAsset = data.assetCache["TEMP-"+name];

    return uploadAsset()
      .then(function(ret) {
        var id = (cachedAsset ? cachedAsset.id : null);
        if(cachedTempAsset) {
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
}
