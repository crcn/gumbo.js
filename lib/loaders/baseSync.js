var outcome = require("outcome"),
step = require("step");

module.exports = require("./base").extend({

  /**
   */

  "override __construct": function(options) {
    if(!options) options = {};
    this._super(options);
    this._timeout   = options.timeout || 1000 * 60; //sync every N seconds_
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
    var self = this, collection = this._collection,
    o = outcome.e(callback),
    source;
    
    var updatedAt;

    step(

      /**
       */

      function() {
        self._load({ }, this);
      },

      /**
       */

      o.s(function(s) {
        //need to copy it incase the array is re-used - see node-ectwo
        //tags
        source = s.concat();
        updatedAt = new Date();
        self._update(updatedAt, source, this);
      }),

      /**
       */

      o.s(function() {
        collection.insert(source).now().exec(this);
      }),


      /**
       */

      o.s(function() {


        //remove any items that might have been removed in the remote collection
        collection.remove({ updatedAt: {$lt: updatedAt }}).now().exec(this);
      }),

      /**
       */

      callback
    );
  },

  /**
   */

  "loadOne": function(id, callback) {

    var self = this, o = outcome.e(callback);

    this._load({ _id: id }, outcome.e(callback).s(function(source) {


      step(

        /**
         */

        function() {
          self._update(new Date(), source, this);
        },

        /**
         */

        o.s(function() {
          //if there are items left, then it hasn't been spliced from _update
          if(source.length) {
            return callback(new Error("item " + id + "could not be loaded"));
          } 

          self._collection.findOne({ _id: id }).now().exec(this);
        }),

        /**
         */

        callback
      );




    }));
  },

  /**
   */

  "_update": function(updatedAt, source, next) {

    var self = this, objectsById = { };

    var ids = source.map(function(item) {
        item.updatedAt = updatedAt;
        objectsById[item._id] = item;
        return item._id;
      }),
      search = {},
      ignoreItems = {};

    search._id = { $in: ids };

    this._collection.find(search).now().exec(outcome.s(function(items) {

      items.forEach(function(item) {
        var updatedItem = objectsById[item.get("_id")];

        //update the item
        item.update({$set: updatedItem });

        source.splice(source.indexOf(updatedItem), 1);
      });


      next();
    }));
  },
});