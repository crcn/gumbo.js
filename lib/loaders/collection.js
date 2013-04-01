var structr = require("structr"),
outcome = require("outcome");

/**
 * collection synchronizer
 */

module.exports = require("./base").extend({

  /**
   */

  "__construct": function(options) {
    this._targetCollection = options.target;
    this._query = options.query;
    this._o = outcome.e(this);
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

    watcher = {
      update: function(item) {

        tg.findOne({ _id: item.get("_id") }, outcome.s(function(item) {
          if(!item) return watcher.insert(item);
          tg.update({ _id: item.get("_id") }, { $set: item.get() }).exec();
        }));
      },
      remove: function(item) {
        tg.remove({ _id: item.get("_id") }).exec();
      },
      insert: function(item) {

        var data = JSON.parse(JSON.stringify(item.get()));

        //set the model so there's reference to it
        data._model = item;

        tg.insert(data).exec(self._o.s(function(newItem) {
          if(!newItem.length) return;
          newItem[0].original(item);
        }));
      }
    }





    this._collection.source().forEach(function(item) {
      watcher.insert(item);
    });


    //watch for any new changes
    this._watcher = this._collection.watch(this._query || function() {
      return true;
    }, watcher);

  },

  /**
   */

  "_unwatch": function() {
    if(!this._watcher) return;
    this._watcher.dispose();
    this._watcher = undefined;
  }
});

