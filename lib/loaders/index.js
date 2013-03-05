module.exports = require("./baseSync").extend({

  /**
   */

  "override __construct": function(options) {
    this._super(options);
    this.__load = options.load;
  },

  /**
   */

  "_load": function(options, callback) {
    this.__load(options, callback);
  }
});