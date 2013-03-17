var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
fiddle = require("fiddle"),
_ = require("underscore"),
dref = require("dref");


module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(collection, data) {
		if(!data) data = {};
		this.collection = collection;
		this._data = data;

		//emitted from the collection
		this.on("update", _.bind(this._onUpdate, this));
		this.on("remove", _.bind(this._onRemove, this));

		//the original model when synchronizing data
		this._model = data._model;
		delete data._model;
	},

	/**
	 */

	"get": function(key) {
		return key ? dref.get(this._data, key) : this._data;
	},

	/**
	 */

	"original": function(model) {
		if(!arguments.length) return this._model;
		this._model = model;
		return this;
	},

	/**
	 */

	"_refresh": function(data) {
		this.update({ $set: data });
	},

	/**
	 */

	"update": function(set) {
		this.collection._update(this, set);
	},

	/**
	 */

	"remove": function() {
		this.collection._remove(this);
	},

	/**
	 */

	"toObject": function() {
		return this._data;
	},

	/**
	 */

	"dispose": function() {
		//OVERRIDE ME
	},

	/**
	 */

	"_onUpdate": function() {
		//OVERRIDE ME
	},

	/**
	 */

	"_onRemove": function() {
		//OVERRIDE ME
	}
});