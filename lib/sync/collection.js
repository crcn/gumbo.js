var structr = require("structr");

/**
 * collection synchronizer
 */

module.exports = structr({

  /**
   */

  "__construct": function(options) {
    this._targetCollection = options.target;
    this._query = options.query;
  },


  /**
   */

  "collection": function(value) {
    if(!arguments.length) return this._sourceCollection;
    this._sourceCollection = value;
    this._watch();
    return this;
  },


  /**
   */

  "_watch": function() {
    this._unwatch();

    var self = this,
    watcher,
    tg = this._targetCollection;


    this._watcher = this._sourceCollection.watch(this._query || function() {
      return true;
    }, watcher = {
      update: function(item) {

        if(tg.count({ _id: item.get("_id") }).sync() == 0) {
          return watcher.insert(item);
        }

        tg.update({ _id: item.get("_id") }, { $set: item.get() }).sync();
      },
      remove: function(item) {
        tg.remove({ _id: item.get("_id") }).sync();
      },
      insert: function(item) {
        var data = JSON.parse(JSON.stringify(item.get()));
        data._model = item;
        tg.insert(data).sync();
      }
    })
  },


  /**
   */

  "_unwatch": function() {
    if(!this._watcher) return;
    this._watcher.dispose();
    this._watcher = undefined;
  }
});

