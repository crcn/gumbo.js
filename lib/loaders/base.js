var structr = require("structr"),
_ = require("underscore"),
outcome = require("outcome"),
EventEmitter = require("events").EventEmitter,
outcome = require("outcome");


/** 
 * persist the remote collection to the mongodb collection, and keeps in synchronized
 */

module.exports = structr(EventEmitter, {

  /**
   */

  "__construct": function(options) {
    this._options = options;
  },

  /**
   */

  "collection": function(value) {

    if(arguments.length) { 
      this._collection = value;
      this._resetCollection();
    }

    return this._collection;
  },

  /**
   */

  "queue": function(value) {
    if(!arguments.length) {
      return this._queue;
    }
    this._queue = value;
  },
  
  /**
   * explicitly loads the collection
   */

  "load": function(options, cb) {

    if(arguments.length === 1) {
      cb = options;
      options = {};
    }
    
    var self = this;
    if(!cb) cb = function(){};
    this._collection.queue().push(function(next) {
      self._load2(options, outcome.e(function(err) {
        cb(err);
        next();
      }).s(function() {
        cb.apply(this, arguments);
        next();
      }));
    });
  },

  /**
   */

  "_load2": function(options, callback) {
    callback();
  },

  /**
   * synchronizes one item
   */

  "loadOne": function(id, callback) {
    //OVERRIDE ME
  },

  /**
   */

  "_load": function(query, callback) {
    throw new Error("must be overridden");
  },


  /**
   */

  "_resetCollection": function() {
    //OVERRIDE ME
  }

});