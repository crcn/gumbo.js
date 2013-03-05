var structr = require("structr"),
sift = require("sift"),
_  = require("underscore"),
disposable = require("disposable");

module.exports = structr({

	/**
	 */

	"__construct": function(collection) {
		this._listeners = {};
		this._collection = collection;

		var self = this;

		[
			"insert",
			"update",
			"remove"
		].forEach(function(event) {
			self._collection.on(event, _.bind(self._onEvent, self, event));
		})
	},

	/**
	 */

	"emit": function(type, data) {
		this._emit(type, data);
		this._emit("change", data);
	},

	/**
	 */

	"_emit": function(type, item) {
		var listeners = this._listeners[type] || [];
		for(var i = listeners.length; i--;) {
			var listener = listeners[i];
			if(listener.test(item)) {
				listener.callback(item);
			}
		}
	},

	/**
	 */

	"on": function(query, type, callback) {

		if(typeof type == "object") {
			var disp = disposable.create();
			for(var t in type) {
				disp.add(this.on(query, t, type[t]));
			}
			return disp;
		}

		var collection;

		if(!this._listeners[type]) this._listeners[type] = [];

		var listener = {
			query: query,
			test: this._tester(query),
			callback: callback
		};

		(collection = this._listeners[type]).push(listener);

		return {
			dispose: function() {
				var i;
				if(~(i = collection.indexOf(listener)))
					collection.splice(i, 1);
			}
		};
	},

	/**
	 */

	"_tester": function(query) {
		if(!query) return function() { return true; }
		return this._collection._tester(query);
	},

	/**
	 */

	"_onEvent": function(type, item) {
		this.emit(type, item);
	}
});