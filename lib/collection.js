var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
sift = require("sift"),
fiddle = require("fiddle"),
Iterator = require("./iterator"),
Query = require("./query"),
id = require("./id"),
Watcher = require("./watcher"),
model = require("./model"),
_ = require("underscore"),
outcome = require("outcome"),
Loader    = require("./loaders"),
CollectionLoader = require("./loaders/collection"),
toarray = require("toarray"),
cstep = require("cstep"),
tq = require("tq");

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(source, modelFactory) {
		var self = this;
		this._source = [];
		this._watcher = new Watcher(this);
		this._queue = tq.create().start();

		this._createModel = modelFactory || _.bind(this._createDefaultModel, this);
		self.insert(source || []).exec();
	},

	/**
	 */

	"loader": function(options) {
		var clazz = options.LoaderClass || Loader,
		loader = new clazz(options);

		loader.collection(this);
		return loader;
	},

	/**
	 * sync to a collection
	 */

	"syncTo": function(query, targetCollection) {

		if(arguments.length === 1) {
			targetCollection = query;
			query = undefined;
		}

		return this.loader({
			LoaderClass: CollectionLoader,
			target: targetCollection,
			query: query
		});
	},

	/**
	 */

	"queue": function() {
		return this._queue;
	},

	/**
	 */

	"source": function() {
		return this._source;
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

	"all": function(next) {
		return new Query(this, function(){ return true; }, next).find();
	},

	/**
	 */

	"find": function(search, next) {
		if(!search) return this.all(search, next);
		return new Query(this, search, next).find();
	},

	/**
	 */

	"findOne": function(search, next) {
		return new Query(this, search, next).find().one();
	},

	/**
	 */

	"findAll": function(next) {
		return new Query(this, function(){ return true; }, next).find();
	},

	/**
	 */

	"count": function(search, next) {
		return new Iterator(this._source, { next: next }).
		queue(this.queue()).
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


		return new Iterator(toarray(newItem), { next: next }).
		queue(this.queue()).
		wait().
		capture().
		each(function(newItem, i, next) {


			if(!newItem._id) {
				newItem._id = id.generate();
			} else {

				var oldItem, foundItem;

				for(var i = self._source.length; i--;) {
					oldItem = self._source[i];
					if(oldItem.get("_id") == newItem._id) {
						foundItem = oldItem;;
						break;
					};
				}

				if(foundItem) {
					if(update) {
						foundItem._refresh(newItem);
						next(null, oldItem);
					} else {
						next(null, false);
					}
					return;
				}
			}

			var item = self._createModel(self, newItem);
			self._source.push(item);
			self.emit("insert", item);
			next(null, item);
		})
	},

	/**
	 */

	"_createDefaultModel": function(collection, item) {
		return new model.Base(collection, item);
	},

	/**
	 */

	"update": function(search, update, next) {

		var tester = this._tester(search),
		fiddler = fiddle(update),
		self = this;


		return new Iterator(this, { one: !!search._id }).
		queue(this.queue()).
		each(function(item, i) {
			if(!tester(item)) return;
			fiddler(item.toObject());
			item.emit("update");
			self.emit("update", item, i, search, update);
		}).exec(next);
	},

	/**
	 */

	"remove": function(search, next) {

		var tester = this._tester(search),
		source = this._source,
		self = this;


		return new Iterator(source, { next: next, one: !!search._id }).
		queue(this.queue()).
		wait().
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

		var test = sift(search).test;

		return function(item) {
			return test(item.toObject());
		}
	}

});