module.exports = {
  command: "web",
  description: "Generate github pages for the package index",
  parse: function(yargs) {
    return yargs
      .strict()
      .demand(0)
      .usage("Usage: $0 "+module.exports.command+" [root-dir]")
      .help("h")
      .argv;
  },
  handler: function(argv) {
    console.log("Not yet implemented");
  }
};
