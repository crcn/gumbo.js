module.exports = require("./base").extend({

  /**
   */

  "override __construct": function(options) {
    this._super(options);
    this.__load = options.load;
  },

  /**
   */

  "_load": function(callback) {
    this.__load(callback);
  }
});