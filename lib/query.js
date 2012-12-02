var structr = require("structr"),
Iterator = require("./iterator"),
sorter = require("./sorter"),
sift = require("sift");

module.exports = structr({

	/**
	 */

	"__construct": function(source, query, cb) {
		this._source = source;
		this._cb = cb;
		this._query = query;
		this.options = {};

		if(cb) {
			var self = this;
			process.nextTick(function() {
				self.exec(cb);
			})
		}
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

	"exec": function(cb) {
		return this._results().exec(cb);
	},

	/**
	 */

	"sync": function() {
		return this._results().sync();
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

	"_results": function() {
		var ops = this.options;

		var iter = this._iterator();

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
				results = results.slice(ops.skip || 0, ops.limit);
			}


			return ops.one ? results[0] : results;
		});
	},

	/**
	 */

	"_iterator": function() {

		var sifter = sift(this._query);

		return new Iterator(this._source).
		capture().
		each(function(item) {
			var p = sifter.score(item.toObject());
			return ~p ? { item: item, score: p } : false;
		});
	},
});