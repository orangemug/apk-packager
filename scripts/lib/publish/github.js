var GitHubApi = require("github");


var github = new GitHubApi({
  // debug: true,
  protocol: "https",
  host: "api.github.com",
  Promise: Promise,
  timeout: 10*1000
});

github.authenticate({
  type: "oauth",
  token: process.env.GITHUB_ACCESS_TOKEN
});
