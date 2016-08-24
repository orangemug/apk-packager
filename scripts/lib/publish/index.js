var info   = require("./info");
var modify = require("./modify");
var errors = require("./errors");


module.exports = function() {
  info()
    .then(modify)
    .catch(errors.log);
}
