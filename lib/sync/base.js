var structr = require("structr"),
_ = require("underscore"),
outcome = require("outcome"),
EventEmitter = require("events").EventEmitter;


/** 
 * persist the remote collection to the mongodb collection, and keeps in synchronized
 */

module.exports = structr(EventEmitter, {

  /**
   */

  "__construct": function(options) {
    this._timeout   = options.timeout || 1000 * 60; //sync every N seconds
    this._uniqueKey = options.uniqueKey;

    if(!options.uniqueKey) {
      throw new Error("unique key must exist");
    }
  },

  /**
   */

  "collection": function(value) {
    if(arguments.length) this._collection = value;
    return this._collection;
  },

  /**
   */

  "start": function(callback) {

    if(!callback) callback = function(){};
    this.stop();
    this._stopped = false;

    var self = this;

    function load() {
      self.load(function() {
        if(self._stopped) return;
        self._syncInterval = setTimeout(load, self._timeout);
      });
    }

    load();

    this.once("loaded", callback);

    return this;
  },

  /**
   */

  "stop": function() {
    this._stopped = true;
    clearTimeout(this._syncInterval);
    return this;
  },  

  /**
   * explicitly loads the collection
   */

  "step load": function(next) {

    var self = this, collection = this._collection, uk = this._uniqueKey;

    collection._wait(function(next) {


      self._load({ }, outcome.e(next).s(function(source) {

        //need to copy it incase the array is re-used - see node-ectwo
        //tags
        source = source.concat();

        var objectsById = {}, updatedAt = new Date();


        self._update(updatedAt, source);

        collection.insert(source).sync();
        collection.remove({ updatedAt: {$lt: updatedAt }}).sync();
        next();
      }));

    }, next);
  },

  /**
   * synchronizes one item
   */

  "step loadOne": function(id, callback) {
    var self = this
    self._load({ _id: id }, outcome.e(callback).s(function(source) {

      self._update(new Date(), source);

      //if there are items left, then it hasn't been spliced from _update
      if(source.length) {
        console.log(JSON.stringify(source, null, 2));
        console.log(id)
        return callback(new Error("item " + id + "could not be loaded"));
      }

      var search = {};

      callback(null, self._collection.findOne({ _id: id }).sync());
    }));
  },



  /**
   */

  "_update": function(updatedAt, source) {

    var self = this, uk = this._uniqueKey, objectsById = { };

    var ids = source.map(function(item) {
        item.updatedAt = updatedAt;
        objectsById[item[uk]] = item;
        return item[uk];
      }),
      search = {},
      ignoreItems = {};

    search[uk] = { $in: ids };


    this._collection.find(search).sync().forEach(function(item) {

      var updatedItem = objectsById[item.get(uk)];

      //update the item
      item.update({$set: updatedItem });

      source.splice(source.indexOf(updatedItem), 1);
    });
  },


  /**
   */


  "_load": function() {
    throw new Error("must be overridden");
  }

});