module.exports = require("./baseSync").extend({

  /**
   */

  "override __construct": function(options) {
    if(!options) options = {};
    this._super(options);
    this.__load = options.load;
  },

  /**
   */

  "override _load": function(options, callback) {
    if(!this.__load) return this._super(options, callback);
    this.__load(options, callback);
  }
});