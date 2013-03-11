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
Loader    = require("./loaders/base"),
FnLoader    = require("./loaders/fn"),
CollectionLoader = require("./loaders/collection"),
toarray = require("toarray"),
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

	"loader": function(optionsOrClass) {

		if(!arguments.length) return this._loader;

		var options = {}, loader;

		//the class can be passed
		if(typeof optionsOrClass == "function") {
			options.LoaderClass = optionsOrClass;
		} else {
			options = optionsOrClass;
		}



		//the loader class can also be a loader 
		if(optionsOrClass._load)	 {
			loader = optionsOrClass;
		} else {
			loader = new (options.LoaderClass || FnLoader)(options);
		}

		//tie-up the collection
		loader.collection(this);

		return this._loader = loader;
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

	"find": function(search, next) {
		if(!search) return this.all(search, next);
		return new Query(this, search).find().tryExec(next);
	},

	/**
	 */

	"findOne": function(search, next) {
		return new Query(this, search).find().one().tryExec(next);
	},

	/**
	 */

	"findAll": function(next) {
		return new Query(this, function(){ return true; }).find().tryExec(next);
	},

	/**
	 */

	"count": function(search, next) {
		return new Iterator(this._source).
		queue(this.queue()).
		each(this._tester(search)).
		count().
		tryExec(next);
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


		return new Iterator(toarray(newItem)).
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
		}).
		tryExec(next);
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
		self = this;


		return new Iterator(this, { one: !!search._id }).
		queue(this.queue()).
		each(function(item, i) {
			if(!tester(item)) return;
			self._update(item);
		}).tryExec(next);
	},

	/**
	 */

	"remove": function(search, next) {

		var tester = this._tester(search),
		source = this._source,
		self = this;


		return new Iterator(source, { one: !!search._id }).
		queue(this.queue()).
		wait().
		each(function(item, i) {
			if(!tester(item)) return;
			self._remove(item);
		}).
		tryExec(next);
	},


	/**
	 */

	"_remove": function(item) {
		var i = this._source.indexOf(item);
		if(!~i) return;
		this._source.splice(i, 1);
		item.dispose();
		item.emit("remove");
		this.emit("remove", item);
	},


	/**
	 */

	"_update": function(item, data) {
		fiddle(data)(item.toObject());
		item.emit("update");
		this.emit("update", item);
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