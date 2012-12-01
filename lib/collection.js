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
		return new Query(this._source, function(){ return true }, next).find();
	},

	/**
	 */

	"find": function(search, next) {
		if(search._id) return this.findOne(search, next);
		return new Query(this._source, this._tester(search), next).find();
	},

	/**
	 */

	"findOne": function(search, next) {
		return new Query(this._source, this._tester(search), next).find().one();
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
				} else {
					return false;
				}
			}

			return item;
		}).
		transform(function(items) {	
			var item;




			for(var i = items.length; i--;) {
				self._source.push(item = items[i] = new ModelClass(self, items[i]));
				// item.emit("insert");
				self.emit("insert", item);
			}

			return items;
		})
	},

	/**
	 */

	"update": function(search, update, next) {

		var tester = this._tester(search),
		fiddler = fiddle(search, update),
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
		var tester = sift(search).test;
		return function(item) {
			return tester(item.toObject());
		}
	}

});