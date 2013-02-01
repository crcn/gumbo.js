var structr = require("structr"),
_ = require("underscore"),
outcome = require("outcome");


/** 
 * persist the remote collection to the mongodb collection, and keeps in synchronized
 */

module.exports = structr({

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

  "start": function() {
    this.stop();
    this._syncInterval = setInterval(_.bind(this.load, this), this._timeout);
    this.load();
    return this;
  },

  /**
   */

  "stop": function() {
    clearInterval(this._syncInterval);
    return this;
  },  

  /**
   * explicitly loads the collection
   */

  "step load": function(next) {

    var self = this, collection = this._collection, uk = this._uniqueKey;

    collection._wait(function(next) {

      self._load(outcome.e(next).s(function(source) {

        var objectsById = {}, updatedAt = new Date();


        var ids = source.map(function(item) {
          item.updatedAt = updatedAt;
          objectsById[uk] = item;
          return item[uk];
        }),
        search = {},
        ignoreItems = {};

        search[uk] = { $in: ids };

        collection.find(search).sync().forEach(function(item) {

          var updatedItem = objectsById[item.get(uk)];

          //update the item
          item.update(updatedItem);

          source.splice(source.indexOf(updatedItem), 1);
        });

        collection.insert(source).sync();
        collection.remove({ updatedAt: {$lt: updatedAt }}).sync();
        next();
      }));

    }, next);

  },


  /**
   */


  "_load": function() {
    throw new Error("must be overridden");
  }

});