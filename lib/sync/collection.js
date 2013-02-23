var structr = require("structr");

/**
 * collection synchronizer
 */

module.exports = structr({

  /**
   */

  "__construct": function(options) {
    this._targetCollection = options.target;
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

    var self = this;

    this._watcher = this._sourceCollection.watch(function() {
      return true;
    }, {
      update: function(item) {
        self._targetCollection.update({ _id: item.get("_id") }, { $set: item.get() }).sync();
      },
      remove: function(item) {
        self._targetCollection.remove({ _id: item.get("_id") }).sync();
      },
      insert: function(item) {
        var data = JSON.parse(JSON.stringify(item.get()));
        data._model = item;
        self._targetCollection.insert(data).sync();
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

