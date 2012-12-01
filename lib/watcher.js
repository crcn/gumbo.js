var structr = require("structr"),
sift = require("sift"),
_  = require("underscore");

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
			for(var t in type) {
				this.on(query, t, type[t]);
			}
			return;
		}
		if(!this._listeners[type]) this._listeners[type] = [];

		this._listeners[type].push({
			query: query,
			test: this._collection._tester(query),
			callback: callback
		});
	},

	/**
	 */

	"_onEvent": function(type, item) {
		this._emit(type, item);
	}
});