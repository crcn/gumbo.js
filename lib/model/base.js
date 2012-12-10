var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
fiddle = require("fiddle"),
_ = require("underscore"),
dref = require("dref");


module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(collection, data) {
		this.collection = collection;
		this._data = data;
		this.on("update", _.bind(this._onUpdate, this));
		this.on("remove", _.bind(this._onRemove, this));
	},

	/**
	 */

	"get": function(key) {
		return key ? dref.get(this._data, key) : this._data;
	},

	/**
	 */

	"_refresh": function(data) {
		this.update({ $set: data });
	},

	/**
	 */

	"update": function(set) {
		this.collection.update({ _id: this.get("_id") }, set).sync();
	},

	/**
	 */

	"remove": function() {
		this.collection.remove({ _id: this.get("_id") }).sync();
	},

	/**
	 */

	"toObject": function() {
		return this._data;
	},

	/**
	 */

	"dispose": function() {
		
	},

	/**
	 */

	"_onUpdate": function() {

	},

	/**
	 */

	"_onRemove": function() {

	}
});