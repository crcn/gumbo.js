module.exports = require("./base").extend({

  /**
   */

  "override __construct": function(options) {
    this._super(options);
    this._timeout   = options.timeout || 1000 * 60; //sync every N seconds
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
   */


  "_load2": function(query, callback) {
    var self = this, collection = this._collection, uk = this._uniqueKey;

    self._load({ }, outcome.e(next).s(function(source) {
      //need to copy it incase the array is re-used - see node-ectwo
      //tags
      source = source.concat();

      var objectsById = {}, updatedAt = new Date();


      self._update(updatedAt, source);

      collection.insert(source).exec();
      collection.remove({ updatedAt: {$lt: updatedAt }}).exec();
      collection.queue().then(next);
    }));
  },

  /**
   */

  "_load2": function(id, callback) {

    var self = this;

    self._load({ _id: id }, outcome.e(callback).s(function(source) {

      self._update(new Date(), source);

      //if there are items left, then it hasn't been spliced from _update
      if(source.length) {
        return callback(new Error("item " + id + "could not be loaded"));
      }

      var search = {};

      self._collection.findOne({ _id: id }).exec(callback);
    }));
  },

  /**
   */

  "_update": function(updatedAt, source) {

    var self = this, uk = this._uniqueKey, objectsById = { };

    var ids = source.map(function(item) {
        item.updatedAt = updatedAt;
        objectsById[item._id] = item;
        return item._id;
      }),
      search = {},
      ignoreItems = {};

    search._id = { $in: ids };

    this._collection.find(search).exec(outcome.s(function(items) {
      items.forEach(function(item) {
        var updatedItem = objectsById[item.get(uk)];

        //update the item
        item.update({$set: updatedItem });

        source.splice(source.indexOf(updatedItem), 1);
      })
    }));
  },
});