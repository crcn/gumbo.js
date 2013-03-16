var structr = require("structr"),
Iterator = require("./iterator"),
sorter = require("./sorter"),
sift = require("sift");

module.exports = structr({

	/**
	 */

	"__construct": function(collection, query) {
		this._collection = collection;
		this._query = query;
		this.options = {};
		this.options.wait = true;
	},

	/**
	 */

	"limit": function(value) {
		this.options.limit = value;
		return this;
	},

	/**
	 */

	"skip": function(value) {
		this.options.skip = value;
		return this;
	},

	/**
	 */

	"sort": function(value) {
		this.options.sort = value;
		return this;
	},

	/**
	 */

	"tryExec": function(cb) {
		
		if(!cb) {
			var self = this;
			process.nextTick(function() {
				self.exec();
			})
			return this;
		}

		return this.exec(cb);
	},

	/**
	 */

	"exec": function(cb) {
		if(!cb) cb = function(){};
		if(this._executing) return cb(new Error("already executing"));
		this._executing = true;

		this._results().exec(cb);
		return this;
	},

	/**
	 */

	"find": function() {
		return this;
	},

	/**
	 */

	"one": function() {
		this.options.one = true;
		return this;
	},

	/**
	 */

	"now": function() {
		this.options.wait = false;
		return this;
	},

	/**
	 */

	"_results": function() {
		var ops = this.options;

		var iter = this._iterator();


		if(!this.options.wait) {
			iter.now();
		}

		return iter.transform(function(results) {

			//sort the values for $or statements
			results = results.sort(function(a, b) {
				return a.score > b.score ? -1 : 1;
			}).
			map(function(a) {
				return a.item;
			});

			if(typeof ops.sort != "undefined") {
				results = sorter.sort(ops.sort, results);
			}

			if(typeof ops.limit != "undefined") {
				var skip = ops.skip || 0;
				results = results.slice(skip, skip + ops.limit);
			}

			return ops.one ? results[0] : results;
		});
	},

	/**
	 */

	"_iterator": function() {

		var sifter = sift(this._query);

		return new Iterator(this._collection.source()).
		queue(this._collection.queue()).
		wait().
		capture().
		each(function(item) {
			var p = sifter.score(item.toObject());
			return ~p ? { item: item, score: p } : false;
		});
	},
});