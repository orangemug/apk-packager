module.exports = {
  command: "build",
  description: "Build packages in ./apk",
  parse: function(yargs) {
    return yargs
      .reset()
      .usage("Usage: $0 "+module.exports.command+" [package_name] [package_version]")
      .demand(1)
      .help("h")
  },
  handler: function(argv) {
    console.log("build", argv);
  }
};
