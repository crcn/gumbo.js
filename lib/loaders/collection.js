var structr = require("structr");

/**
 * collection synchronizer
 */

module.exports = require("./base").extend({

  /**
   */

  "__construct": function(options) {
    this._targetCollection = options.target;
    this._query = options.query;
  },

  /**
   */

  "_resetCollection": function() {
    this._watch();
  },

  /**
   */

  "_watch": function() {
    this._unwatch();


    var self = this,
    watcher,
    tg = this._targetCollection;

    //perform the initial sync
    tg.insert(this._collection.source().map(function(item) {
      return item.get()
    })).exec();

    //watch for any new changes
    this._watcher = this._collection.watch(this._query || function() {
      return true;
    }, watcher = {
      update: function(item) {

        if(tg.count({ _id: item.get("_id") }).sync() == 0) {
          return watcher.insert(item);
        }

        tg.update({ _id: item.get("_id") }, { $set: item.get() }).exec();
      },
      remove: function(item) {
        tg.remove({ _id: item.get("_id") }).exec();
      },
      insert: function(item) {

        var data = JSON.parse(JSON.stringify(item.get()));

        //set the model so there's reference to it
        data._model = item;

        tg.insert(data).exec();
      }
    });

  },

  /**
   */

  "_unwatch": function() {
    if(!this._watcher) return;
    this._watcher.dispose();
    this._watcher = undefined;
  }
});

