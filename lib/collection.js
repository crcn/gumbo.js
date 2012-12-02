var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
sift = require("sift"),
fiddle = require("fiddle"),
Iterator = require("./iterator"),
Query = require("./query"),
id = require("./id"),
Watcher = require("./watcher"),
model = require("./model");

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(source, modelClass) {
		var self = this;
		this._source = [];
		this._watcher = new Watcher(this);
		this._modelClass = modelClass || model.Base;
		self.insert(source).sync();
	},

	/**
	 */

	"watch": function(query, observers) {
		return this._watcher.on(query, observers);
	},

	/**
	 */

	"watcher": function() {
		return this._watcher;
	},

	/**
	 */

	"all": function(search, next) {
		return new Query(this._source, this._tester(search), next).find();
	},

	/**
	 */

	"find": function(search, next) {
		if(!search) return this.all(search, next);
		return new Query(this._source, this._tester(search), next).find();
	},

	/**
	 */

	"findOne": function(search, next) {
		return new Query(this._source, this._tester(search), next).find().one();
	},

	/**
	 */

	"count": function(search) {
		return new Iterator(this._source).
		each(this._tester(search)).
		count();
	},


	/**
	 */

	"insert": function(newItem, update, next) {

		if(typeof update == "function") {
			next = update;
			update = false;
		}

		if(!newItem._id) {
			newItem._id = id.generate();
		}

		var self = this,
		ModelClass = this._modelClass;

		return new Iterator(newItem instanceof Array ? newItem : [newItem], next).
		capture().
		each(function(item, i) {

			if(!item._id) {
				item._id = id.generate();
				return item;
			}

			var existing;


			if(existing = self.findOne({ _id: item._id }).sync()) {
				if(update) {
					fiddle({ $set: item })(existing.toObject());
					return existing;
				} else {
					return false;
				}
			}

			var item = new ModelClass(self, item);
			self._source.push(item);
			self.emit("insert", item);

			return item;
		});
	},

	/**
	 */

	"update": function(search, update, next) {

		var tester = this._tester(search),
		fiddler = fiddle(update),
		self = this;

		return new Iterator(this._source, { next: next, one: !!search._id }).
		each(function(item, i) {
			if(!tester(item)) return;
			fiddler(item.toObject());
			item.emit("update");
			self.emit("update", item, i, search, update);
		});
	},

	/**
	 */

	"remove": function(search, next) {

		var tester = this._tester(search),
		source = this._source,
		self = this;

		return new Iterator(this._source, { next: next, one: !!search._id }).
		each(function(item, i) {
			if(!tester(item)) return;
			source.splice(i, 1);
			item.dispose();
			item.emit("remove");
			self.emit("remove", item, i, search);
		});
	},

	/**
	 */

	"_tester": function(search) {
		if(!search) {
			return function() {
				return true;
			}
		}

		var tester = sift(search).test;
		return function(item) {
			return tester(item.toObject());
		}
	}

});